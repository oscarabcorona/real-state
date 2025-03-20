/*
  # Update User Role Schema
  
  1. Changes
    - Update user role constraints to include 'lessor' and 'tenant'
    - Add user profile fields for better user identification
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update user role constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'manager', 'user', 'lessor', 'tenant'));

-- Add additional user profile fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS preferred_workspace_id uuid REFERENCES workspaces(id),
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- Create function to select default workspace
CREATE OR REPLACE FUNCTION select_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  default_workspace_id uuid;
BEGIN
  -- Find user's default workspace
  SELECT id INTO default_workspace_id
  FROM workspaces
  WHERE owner_id = NEW.id
  AND is_default = true
  LIMIT 1;
  
  -- Update user with default workspace
  IF default_workspace_id IS NOT NULL THEN
    NEW.preferred_workspace_id = default_workspace_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set default workspace
DROP TRIGGER IF EXISTS select_default_workspace_trigger ON users;
CREATE TRIGGER select_default_workspace_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.preferred_workspace_id IS NULL)
  EXECUTE FUNCTION select_default_workspace();
