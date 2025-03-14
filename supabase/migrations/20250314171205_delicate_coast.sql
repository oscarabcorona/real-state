/*
  # Fix tenant appointments view

  1. Changes
    - Add indexes for better query performance
    - Update RLS policies to ensure proper access
    - Add tenant_user_id to existing appointments

  2. Security
    - Maintain proper access control
    - Ensure data isolation between users
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_user_id ON appointments(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email);
CREATE INDEX IF NOT EXISTS idx_appointments_preferred_date ON appointments(preferred_date);

-- Update existing appointments to set tenant_user_id
UPDATE appointments a
SET tenant_user_id = u.id
FROM users u
WHERE a.email = u.email
AND a.tenant_user_id IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Property owners can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Tenants can view their appointments" ON appointments;

-- Policy for property owners to manage appointments
CREATE POLICY "Property owners can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Policy for creating appointments (public access)
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for tenants to view their appointments
CREATE POLICY "Tenants can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    tenant_user_id = auth.uid()
    OR
    email = (SELECT email FROM users WHERE id = auth.uid())
  );