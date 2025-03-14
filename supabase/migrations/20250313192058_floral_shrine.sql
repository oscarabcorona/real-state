/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Restructure property policies to use direct joins
    - Eliminate nested subqueries
    - Use simplified policy structure

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop all existing property policies
DROP POLICY IF EXISTS "owners_all" ON properties;
DROP POLICY IF EXISTS "public_read_published" ON properties;
DROP POLICY IF EXISTS "tenants_read_leased" ON properties;

-- Owner access - direct user_id check
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

-- Tenant access - direct join without subqueries
CREATE POLICY "tenant_access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM property_leases pl
      JOIN tenants t ON t.id = pl.tenant_id
      WHERE pl.property_id = properties.id
      AND pl.status = 'active'
      AND t.user_id = auth.uid()
    )
  );