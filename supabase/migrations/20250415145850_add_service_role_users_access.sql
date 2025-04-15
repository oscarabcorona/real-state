-- Add function to safely get user details by ID using service role
CREATE OR REPLACE FUNCTION get_user_details_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' AS full_name
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

-- Grant function execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_user_details_by_id(UUID) TO authenticated, anon;

-- Add function to safely get user details by email using service role
CREATE OR REPLACE FUNCTION get_user_details_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' AS full_name
  FROM auth.users u
  WHERE u.email = user_email;
END;
$$;

-- Grant function execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_user_details_by_email(TEXT) TO authenticated, anon;

COMMENT ON FUNCTION get_user_details_by_id IS 'Securely fetch user details by ID via service role permissions';
COMMENT ON FUNCTION get_user_details_by_email IS 'Securely fetch user details by email via service role permissions';

-- Create a view to list property invites with resolved property and user information
CREATE OR REPLACE VIEW property_invites_with_details AS
SELECT 
  pi.id,
  pi.property_id,
  pi.email,
  pi.invite_type,
  pi.status,
  pi.message,
  pi.invite_token,
  pi.expires_at,
  pi.created_at,
  pi.updated_at,
  pi.created_by,
  p.name AS property_name,
  COALESCE(u.email, '') AS inviter_email,
  COALESCE(u.raw_user_meta_data->>'full_name', '') AS inviter_name
FROM 
  property_invites pi
JOIN 
  properties p ON pi.property_id = p.id
LEFT JOIN 
  auth.users u ON pi.created_by = u.id;

-- Grant access to the view for authenticated users
GRANT SELECT ON property_invites_with_details TO authenticated;

-- Create a safer RLS policy for property_invites
DO $$
BEGIN
  -- Create RLS policy for property_invites
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'user_id'
  ) THEN
    -- If user_id column exists
    EXECUTE format('
      CREATE POLICY "Users can view their own and their property invites"
      ON property_invites
      FOR SELECT
      TO authenticated
      USING (
        email = auth.email() OR 
        created_by = auth.uid() OR
        property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
      )
    ');
  ELSE
    -- Assume owner_id column exists instead
    EXECUTE format('
      CREATE POLICY "Users can view their own and their property invites"
      ON property_invites
      FOR SELECT
      TO authenticated
      USING (
        email = auth.email() OR 
        created_by = auth.uid()
      )
    ');
  END IF;
END
$$;
