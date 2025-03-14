/*
  # Update users table role management

  1. Changes
    - Update role constraint to support lessor and tenant roles
    - Add role description
    - Ensure all existing users have valid roles

  2. Security
    - Maintain existing RLS policies
*/

-- First, temporarily disable the existing role constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

-- Update any NULL or invalid roles to 'lessor'
UPDATE users
SET role = 'lessor'
WHERE role IS NULL OR role NOT IN ('lessor', 'tenant');

-- Make role required
ALTER TABLE users
ALTER COLUMN role SET NOT NULL;

-- Now it's safe to add the new constraint
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role = ANY (ARRAY['lessor', 'tenant']::text[]));

-- Add role description
COMMENT ON COLUMN users.role IS 'User roles:
- lessor: Property owner or manager
- tenant: Property renter';