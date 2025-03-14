/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Completely restructure property policies to eliminate recursion
    - Use direct tenant access through property_leases
    - Separate read and write permissions clearly

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop all existing property policies
DROP POLICY IF EXISTS "Property owner access" ON properties;
DROP POLICY IF EXISTS "Published property access" ON properties;
DROP POLICY IF EXISTS "Tenant property access" ON properties;

-- Owner can do everything with their properties
CREATE POLICY "owners_all"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Anyone can read published properties
CREATE POLICY "public_read_published"
  ON properties
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Tenants can read their leased properties
CREATE POLICY "tenants_read_leased"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM tenants t, property_leases pl
      WHERE pl.property_id = properties.id
      AND pl.tenant_id = t.id
      AND pl.status = 'active'
      AND t.user_id = auth.uid()
    )
  );