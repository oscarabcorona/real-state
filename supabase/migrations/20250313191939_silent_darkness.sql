/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Simplify property policies to avoid recursion
    - Use direct user_id checks for ownership
    - Separate policies for different access patterns

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop all existing property policies to start fresh
DROP POLICY IF EXISTS "Property owner access" ON properties;
DROP POLICY IF EXISTS "Published property access" ON properties;
DROP POLICY IF EXISTS "Tenant property access" ON properties;

-- Direct owner access - simplest possible policy
CREATE POLICY "Property owner access"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Published properties - simple boolean check
CREATE POLICY "Published property access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Tenant access - simplified subquery
CREATE POLICY "Tenant property access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT pl.property_id 
      FROM property_leases pl
      JOIN tenants t ON t.id = pl.tenant_id
      WHERE t.user_id = auth.uid()
      AND pl.status = 'active'
    )
  );