/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Simplify property policies to avoid recursion
    - Use basic user_id checks for direct ownership
    - Add separate published property access

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Tenant property access" ON properties;

-- Basic owner access policy
CREATE POLICY "Property owner access"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Published property access
CREATE POLICY "Published property access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Tenant property access through leases
CREATE POLICY "Tenant property access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM tenants t
      JOIN property_leases pl ON pl.tenant_id = t.id
      WHERE pl.property_id = properties.id
      AND pl.status = 'active'
      AND t.user_id = auth.uid()
    )
  );