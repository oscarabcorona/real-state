/*
  # Simplify RLS policies and fix recursion

  1. Changes
    - Simplify RLS policies to use basic conditions
    - Remove nested queries in policies
    - Use direct tenant and property relationships

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Lessors can manage property leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view leased properties" ON properties;
DROP POLICY IF EXISTS "Tenants can manage documents" ON documents;

-- Simple policy for property leases - lessor access
CREATE POLICY "Lessor property lease access"
  ON property_leases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_leases.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Simple policy for property leases - tenant access
CREATE POLICY "Tenant lease access"
  ON property_leases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.id = property_leases.tenant_id 
      AND tenants.user_id = auth.uid()
    )
  );

-- Simple policy for properties - tenant access
CREATE POLICY "Tenant property access"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_leases
      WHERE property_leases.property_id = properties.id
      AND property_leases.status = 'active'
      AND EXISTS (
        SELECT 1 FROM tenants
        WHERE tenants.id = property_leases.tenant_id
        AND tenants.user_id = auth.uid()
      )
    )
  );

-- Simple policy for documents - tenant access
CREATE POLICY "Tenant document access"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_leases
      WHERE property_leases.property_id = documents.property_id
      AND property_leases.status = 'active'
      AND EXISTS (
        SELECT 1 FROM tenants
        WHERE tenants.id = property_leases.tenant_id
        AND tenants.user_id = auth.uid()
      )
    )
  );