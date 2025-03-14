/*
  # Assign property to tenant

  1. Changes
    - Assigns property 5fc5f670-c6df-43fa-ab90-4721b1793547 to user with email 1@gmail.com
    - Updates the property's tenant_id field
*/

-- First get the tenant ID for the user with email 1@gmail.com
DO $$
DECLARE
  tenant_record_id uuid;
BEGIN
  -- Get or create tenant record for the user
  INSERT INTO tenants (id, user_id, name, status)
  SELECT 
    gen_random_uuid(),
    users.id,
    users.email,
    'active'
  FROM users
  WHERE users.email = '1@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM tenants WHERE user_id = users.id
  )
  RETURNING id INTO tenant_record_id;

  -- If tenant record already existed, get its ID
  IF tenant_record_id IS NULL THEN
    SELECT id INTO tenant_record_id
    FROM tenants
    WHERE user_id = (SELECT id FROM users WHERE email = '1@gmail.com');
  END IF;

  -- Update the property with the tenant ID
  UPDATE properties
  SET 
    tenant_id = tenant_record_id,
    updated_at = now()
  WHERE id = '5fc5f670-c6df-43fa-ab90-4721b1793547';
END $$;