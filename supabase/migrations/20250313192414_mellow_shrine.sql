/*
  # Simplify property policies to absolute minimum

  1. Changes
    - Drop existing policies
    - Create minimal policies with no joins or subqueries
    - Use separate tables for different access patterns
*/

-- Drop existing policies
DROP POLICY IF EXISTS "owner_access" ON properties;
DROP POLICY IF EXISTS "published_access" ON properties;
DROP POLICY IF EXISTS "tenant_access" ON properties;

-- Create a separate table for tenant property access
CREATE TABLE IF NOT EXISTS tenant_property_access (
  tenant_user_id uuid REFERENCES auth.users(id),
  property_id uuid REFERENCES properties(id),
  PRIMARY KEY (tenant_user_id, property_id)
);

-- Populate tenant property access from existing leases
INSERT INTO tenant_property_access (tenant_user_id, property_id)
SELECT DISTINCT t.user_id, pl.property_id
FROM property_leases pl
JOIN tenants t ON t.id = pl.tenant_id
WHERE pl.status = 'active'
ON CONFLICT DO NOTHING;

-- Enable RLS on tenant property access
ALTER TABLE tenant_property_access ENABLE ROW LEVEL SECURITY;

-- Basic access policy for tenant property access
CREATE POLICY "tenant_property_access_policy"
  ON tenant_property_access
  FOR ALL
  TO authenticated
  USING (tenant_user_id = auth.uid());

-- Simple owner access - direct user_id check
CREATE POLICY "owner_access"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Published properties - simple boolean check
CREATE POLICY "published_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Tenant access - direct lookup in access table
CREATE POLICY "tenant_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT property_id 
      FROM tenant_property_access 
      WHERE tenant_user_id = auth.uid()
    )
  );

-- Create trigger to maintain tenant property access
CREATE OR REPLACE FUNCTION update_tenant_property_access()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO tenant_property_access (tenant_user_id, property_id)
    SELECT t.user_id, NEW.property_id
    FROM tenants t
    WHERE t.id = NEW.tenant_id
    AND NEW.status = 'active'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_lease_tenant_access
  AFTER INSERT OR UPDATE ON property_leases
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_property_access();