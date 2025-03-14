/*
  # Fix payment policies for tenant access

  1. Changes
    - Drop existing payment policies
    - Add new policies for tenant access through tenant_property_access
    - Maintain existing lessor access policies
    - Add policy for tenants to update their own payments

  2. Security
    - Ensure tenants can only view and pay payments for their properties
    - Maintain proper access control for lessors
*/

-- Drop existing payment policies
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

-- Policy for lessors to manage payments
CREATE POLICY "Lessors can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = payments.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Policy for tenants to view payments for their properties
CREATE POLICY "Tenants can view property payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_property_access
      WHERE tenant_property_access.property_id = payments.property_id
      AND tenant_property_access.tenant_user_id = auth.uid()
    )
  );

-- Policy for tenants to update payments (e.g., mark as paid)
CREATE POLICY "Tenants can update property payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_property_access
      WHERE tenant_property_access.property_id = payments.property_id
      AND tenant_property_access.tenant_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_property_access
      WHERE tenant_property_access.property_id = payments.property_id
      AND tenant_property_access.tenant_user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_property_id_status ON payments(property_id, status);