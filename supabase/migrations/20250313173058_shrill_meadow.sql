/*
  # Fix User Policies Recursion

  1. Changes
    - Remove recursive admin policy
    - Simplify RLS policies to prevent infinite recursion
    - Maintain secure access control

  2. Security
    - Ensure users can only access their own data
    - Maintain basic security principles
    - Remove complex policy conditions that could cause recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;

-- Create simplified policies without recursion
CREATE POLICY "Enable read access to own user profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert access for registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access to own user profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);