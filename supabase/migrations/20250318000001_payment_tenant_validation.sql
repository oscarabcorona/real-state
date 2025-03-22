/*
  # Add tenant validation for payments
  
  1. Changes
    - Add function to check if property has an active tenant
    - Add trigger to validate payments on insert/update
    - Update payment policies to enforce this constraint
  
  2. Security
    - Ensure payments can only be created for properties with tenants
*/

-- Function to check if a property has an active tenant
CREATE OR REPLACE FUNCTION has_active_tenant(p_property_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM property_leases pl
    WHERE pl.property_id = p_property_id
    AND pl.status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to validate payment creation
CREATE OR REPLACE FUNCTION validate_payment_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if property has an active tenant
  IF NOT has_active_tenant(NEW.property_id) THEN
    RAISE EXCEPTION 'Cannot create payment for property without an active tenant';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment validation
DROP TRIGGER IF EXISTS validate_payment_tenant_trigger ON payments;
CREATE TRIGGER validate_payment_tenant_trigger
  BEFORE INSERT OR UPDATE OF property_id ON payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_tenant();

-- Update payment policies to include tenant check in WITH CHECK clause
DROP POLICY IF EXISTS "Lessors can manage payments" ON payments;

-- Policy for lessors to manage payments
CREATE POLICY "Lessors can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = payments.property_id
      AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = payments.property_id
      AND properties.user_id = auth.uid()
      AND has_active_tenant(payments.property_id)
    )
  );

-- Modify the function to handle both lessors and tenants
CREATE OR REPLACE FUNCTION get_properties_with_tenants(p_user_id uuid)
RETURNS TABLE(
  property_id uuid,
  property_name text,
  tenant_count bigint,
  user_role text
) AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if user is a lessor or tenant based on role in users table
  SELECT role INTO user_role FROM users WHERE id = p_user_id;
  
  IF user_role = 'lessor' THEN
    -- For lessors: return properties they own that have active tenants
    RETURN QUERY
    SELECT 
      p.id as property_id,
      p.name as property_name,
      COUNT(pl.id) as tenant_count,
      'lessor'::text as user_role
    FROM properties p
    LEFT JOIN property_leases pl ON pl.property_id = p.id AND pl.status = 'active'
    WHERE p.user_id = p_user_id
    GROUP BY p.id, p.name
    HAVING COUNT(pl.id) > 0;
  ELSE
    -- For tenants: return properties they are currently leasing
    RETURN QUERY
    SELECT 
      p.id as property_id,
      p.name as property_name,
      1::bigint as tenant_count,
      'tenant'::text as user_role
    FROM properties p
    JOIN property_leases pl ON pl.property_id = p.id AND pl.status = 'active'
    JOIN tenants t ON t.id = pl.tenant_id
    WHERE t.user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
