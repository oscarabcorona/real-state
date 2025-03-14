/*
  # Fix tenant appointments access

  1. Changes
    - Update RLS policies for appointments table
    - Allow tenants to view their own appointments
    - Maintain existing lessor access

  2. Security
    - Ensure proper access control
    - Maintain data isolation between users
*/

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Property owners can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;

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

-- Policy for tenants to view their own appointments
CREATE POLICY "Tenants can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    tenant_user_id = auth.uid()
    OR
    email = (SELECT email FROM users WHERE id = auth.uid())
  );