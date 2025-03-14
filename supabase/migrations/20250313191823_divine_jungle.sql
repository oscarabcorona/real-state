/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Simplify RLS policies to use direct conditions
    - Remove nested EXISTS clauses
    - Use simple IN conditions for better performance

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Lessor property lease access" ON property_leases;
DROP POLICY IF EXISTS "Tenant lease access" ON property_leases;
DROP POLICY IF EXISTS "Tenant property access" ON properties;
DROP POLICY IF EXISTS "Tenant document access" ON documents;

-- Simple policy for property leases - lessor access
CREATE POLICY "Lessor property lease access"
  ON property_leases
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Simple policy for property leases - tenant access
CREATE POLICY "Tenant lease access"
  ON property_leases
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Simple policy for properties - tenant access
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

-- Simple policy for documents - tenant access
CREATE POLICY "Tenant document access"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT pl.property_id 
      FROM property_leases pl
      JOIN tenants t ON t.id = pl.tenant_id
      WHERE t.user_id = auth.uid()
      AND pl.status = 'active'
    )
  );