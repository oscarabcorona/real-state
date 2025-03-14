/*
  # Simplify property policies to prevent recursion

  1. Changes
    - Drop existing policies
    - Create minimal, non-recursive policies
    - Use simple IN clauses instead of EXISTS
    - Avoid nested queries where possible
*/

-- Drop existing policies
DROP POLICY IF EXISTS "owner_access" ON properties;
DROP POLICY IF EXISTS "published_access" ON properties;
DROP POLICY IF EXISTS "tenant_access" ON properties;

-- Basic owner access - direct user_id check
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

-- Tenant access - flat subquery with direct joins
CREATE POLICY "tenant_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT property_id 
      FROM property_leases pl
      WHERE pl.tenant_id IN (
        SELECT id FROM tenants WHERE user_id = auth.uid()
      )
      AND pl.status = 'active'
    )
  );