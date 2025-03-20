/*
  # Add Multi-workspace Support
  
  1. New Tables
    - workspaces table for region-based property management
    - user_workspaces junction table for many-to-many relationships
  
  2. Changes
    - Link properties to workspaces instead of directly to users
    - Update RLS policies for proper workspace-based access
    - Migrate existing properties to default workspaces
  
  3. Security
    - Add workspace-based RLS policies
    - Maintain proper access control
*/

-- Create workspaces table
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  region text,
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  is_default boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_workspaces junction table
CREATE TABLE user_workspaces (
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

-- Add workspace_id to properties table
ALTER TABLE properties
ADD COLUMN workspace_id uuid REFERENCES workspaces(id);

-- Create indexes for better performance
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);
CREATE INDEX idx_properties_workspace_id ON properties(workspace_id);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workspaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they belong to"
  ON workspaces
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_workspaces
      WHERE user_workspaces.workspace_id = workspaces.id
      AND user_workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage their workspaces"
  ON workspaces
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create RLS policies for user_workspaces
CREATE POLICY "Users can view their workspace memberships"
  ON user_workspaces
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Workspace owners can manage memberships"
  ON user_workspaces
  FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Update properties policy to use workspace-based access
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can manage properties through tenants" ON properties;

CREATE POLICY "Users can manage properties through workspaces"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM user_workspaces
      WHERE user_workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM user_workspaces
      WHERE user_workspaces.user_id = auth.uid()
    )
  );

-- Migrate existing properties to default workspaces
DO $$
DECLARE
  user_record RECORD;
  new_workspace_id uuid;  -- Renamed variable to avoid ambiguity
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM properties WHERE workspace_id IS NULL
  LOOP
    -- Create default workspace for each user
    INSERT INTO workspaces (
      name,
      description,
      region,
      owner_id,
      is_default
    ) VALUES (
      'Default Workspace',
      'Automatically created default workspace',
      'Default',
      user_record.user_id,
      true
    ) RETURNING id INTO new_workspace_id;  -- Updated variable name

    -- Add user to workspace
    INSERT INTO user_workspaces (
      user_id,
      workspace_id,
      role
    ) VALUES (
      user_record.user_id,
      new_workspace_id,  -- Updated variable name
      'owner'
    );

    -- Update properties to belong to the workspace
    UPDATE properties
    SET
      workspace_id = new_workspace_id  -- Fixed ambiguous reference
    WHERE
      user_id = user_record.user_id
      AND workspace_id IS NULL;
  END LOOP;
END $$;

-- Make workspace_id required after migration
ALTER TABLE properties
ALTER COLUMN workspace_id SET NOT NULL;

-- Create function to create default workspace for new users
CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create workspace for lessors
  IF NEW.role = 'lessor' THEN
    -- Create default workspace
    INSERT INTO workspaces (
      name,
      description,
      owner_id,
      is_default
    ) VALUES (
      'Default Workspace',
      'Your default workspace',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create a workspace for new lessors
DROP TRIGGER IF EXISTS create_default_workspace_trigger ON users;
CREATE TRIGGER create_default_workspace_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_workspace();

-- Create function to get user's default workspace
CREATE OR REPLACE FUNCTION get_default_workspace(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  workspace_id uuid;
BEGIN
  -- Try to find default workspace
  SELECT w.id INTO workspace_id
  FROM workspaces w
  WHERE w.owner_id = p_user_id
  AND w.is_default = true
  LIMIT 1;
  
  -- If no default workspace, get any workspace
  IF workspace_id IS NULL THEN
    SELECT w.id INTO workspace_id
    FROM workspaces w
    JOIN user_workspaces uw ON uw.workspace_id = w.id
    WHERE uw.user_id = p_user_id
    LIMIT 1;
  END IF;
  
  RETURN workspace_id;
END;
$$ LANGUAGE plpgsql;
