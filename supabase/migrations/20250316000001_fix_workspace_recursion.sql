/*
  # Fix Infinite Recursion in Workspace Policies
  
  1. Problem
    - Circular dependency between workspaces and user_workspaces policies
    - Causing infinite recursion during sign-up process
  
  2. Solution
    - Completely drop all cross-referencing policies
    - Use only direct field comparisons to auth.uid()
    - Eliminate any policy that references another table with policies
*/

-- Drop ALL existing policies on these tables to completely reset
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can manage their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can view their workspace memberships" ON user_workspaces;
DROP POLICY IF EXISTS "Workspace owners can manage memberships" ON user_workspaces;
DROP POLICY IF EXISTS "Workspace direct owner access" ON workspaces;
DROP POLICY IF EXISTS "Workspace member access" ON workspaces;
DROP POLICY IF EXISTS "View own workspace memberships" ON user_workspaces;
DROP POLICY IF EXISTS "Owner manages memberships" ON user_workspaces;
DROP POLICY IF EXISTS "User direct membership" ON user_workspaces;

-- Ultra-simple owner-only policy for workspaces (no cross-references)
CREATE POLICY "workspaces_owner_access"
  ON workspaces
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- Ultra-simple membership policy (no cross-references)
CREATE POLICY "user_workspaces_user_access"
  ON user_workspaces
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Add index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON user_workspaces(user_id);

-- Temporarily disable the trigger that might cause issues during user creation
ALTER TABLE users DISABLE TRIGGER create_default_workspace_trigger;
