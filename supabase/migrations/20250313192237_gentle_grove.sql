/*
  # Fix property policies to prevent recursion

  1. Changes
    - Drop existing policies that may cause recursion
    - Create simplified policies with direct relationships
    - Avoid nested EXISTS clauses
    - Use straightforward joins for tenant access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "owner_access" ON properties;
DROP POLICY IF EXISTS "published_access" ON properties;
DROP POLICY IF EXISTS "tenant_access" ON properties;

-- Owner access policy
CREATE POLICY "owner_access"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Published properties access
CREATE POLICY "published_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Tenant access policy with direct join
CREATE POLICY "tenant_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT pl.property_id
      FROM property_leases pl, tenants t
      WHERE pl.tenant_id = t.id
      AND pl.status = 'active'
      AND t.user_id = auth.uid()
    )
  );