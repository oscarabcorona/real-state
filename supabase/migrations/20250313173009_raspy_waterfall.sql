/*
  # Fix User RLS Policies

  1. Changes
    - Add policy for users to insert their own records during signup
    - Modify existing policies to be more specific
    - Ensure proper access control for user management

  2. Security
    - Maintain strict RLS while allowing necessary operations
    - Ensure users can only access their own data
    - Allow admins to manage all users
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;

-- Create comprehensive policies for user management
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );