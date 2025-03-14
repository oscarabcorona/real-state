/*
  # Fix property_leases RLS policies

  1. Changes
    - Simplify RLS policies to avoid recursive checks
    - Update policy conditions to use direct relationships
    - Remove nested EXISTS clauses where possible

  2. Security
    - Maintain proper access control for lessors and tenants
    - Ensure data isolation between different users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Lessors can manage their property leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view their leases" ON property_leases;
DROP POLICY IF EXISTS "Tenants can view their leased properties" ON properties;
DROP POLICY IF EXISTS "Tenants can manage their own documents" ON documents;

-- Recreate property_leases policies with direct conditions
CREATE POLICY "Lessors can manage property leases"
  ON property_leases
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view leases"
  ON property_leases
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Recreate properties policy for tenants with direct join
CREATE POLICY "Tenants can view leased properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT pl.property_id 
      FROM property_leases pl
      INNER JOIN tenants t ON t.id = pl.tenant_id
      WHERE t.user_id = auth.uid()
      AND pl.status = 'active'
    )
  );

-- Recreate documents policy for tenants with direct join
CREATE POLICY "Tenants can manage documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT pl.property_id 
      FROM property_leases pl
      INNER JOIN tenants t ON t.id = pl.tenant_id
      WHERE t.user_id = auth.uid()
      AND pl.status = 'active'
    )
  );