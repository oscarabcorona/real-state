/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Drop and recreate property_leases policies to avoid recursion
    - Simplify policy conditions
    - Update related policies to use direct relationships

  2. Security
    - Maintain same security model but with optimized queries
    - Ensure proper access control for lessors and tenants
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Lessors can manage their property leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view their leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view their leased properties" ON properties;
DROP POLICY IF EXISTS "Tenants can manage their own documents" ON documents;

-- Recreate property_leases policies with simplified conditions
CREATE POLICY "Lessors can manage their property leases"
  ON property_leases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM properties 
      WHERE properties.id = property_leases.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their leases"
  ON property_leases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM tenants 
      WHERE tenants.id = property_leases.tenant_id 
      AND tenants.user_id = auth.uid()
    )
  );

-- Recreate properties policy for tenants
CREATE POLICY "Tenants can view their leased properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM property_leases 
      JOIN tenants ON tenants.id = property_leases.tenant_id
      WHERE property_leases.property_id = properties.id
      AND property_leases.status = 'active'
      AND tenants.user_id = auth.uid()
    )
  );

-- Recreate documents policy for tenants
CREATE POLICY "Tenants can manage their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM property_leases 
      JOIN tenants ON tenants.id = property_leases.tenant_id
      WHERE property_leases.property_id = documents.property_id
      AND property_leases.status = 'active'
      AND tenants.user_id = auth.uid()
    )
  );