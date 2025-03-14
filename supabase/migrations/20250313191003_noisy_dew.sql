/*
  # Property-Tenant Relationship Update

  1. Changes
    - Drops existing policies that depend on tenant_id
    - Removes tenant_id from properties table
    - Creates property_leases junction table
    - Adds new policies for proper access control

  2. Security
    - Enables RLS on property_leases table
    - Adds updated policies for lessor and tenant access
*/

-- First drop the dependent policies
DROP POLICY IF EXISTS "Users can manage properties through tenants" ON properties;
DROP POLICY IF EXISTS "Tenants can manage their own documents" ON documents;

-- Now we can safely remove the tenant_id
ALTER TABLE properties
DROP COLUMN IF EXISTS tenant_id;

-- Create property_leases junction table
CREATE TABLE IF NOT EXISTS property_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, tenant_id, start_date)
);

-- Enable RLS
ALTER TABLE property_leases ENABLE ROW LEVEL SECURITY;

-- Policies for property_leases
CREATE POLICY "Lessors can manage their property leases"
  ON property_leases
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their leases"
  ON property_leases
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Update properties policies to allow tenants to view leased properties
CREATE POLICY "Tenants can view their leased properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT property_id 
      FROM property_leases 
      WHERE tenant_id IN (
        SELECT id FROM tenants WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );

-- Update documents policy to use the new property_leases relationship
CREATE POLICY "Tenants can manage their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id
      FROM property_leases
      WHERE tenant_id IN (
        SELECT id FROM tenants WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );

-- Add lease for the specific property and tenant
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

  -- Create the lease record
  INSERT INTO property_leases (property_id, tenant_id)
  VALUES (
    '5fc5f670-c6df-43fa-ab90-4721b1793547',
    tenant_record_id
  )
  ON CONFLICT (property_id, tenant_id, start_date) DO NOTHING;
END $$;