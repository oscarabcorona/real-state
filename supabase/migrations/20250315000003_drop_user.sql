/*
  # Drop Specific User
  
  This migration safely removes a user and all associated data including:
  - Properties linked to the user
  - Workspace memberships
  - Workspaces owned by the user
  - User profile data
*/

-- Set the user ID to be deleted
DO $$
DECLARE
  target_user_id uuid := '08f55d26-e6b4-4ca7-8fdd-57864b9a9e37';
BEGIN
  -- Step 1: Update properties to remove workspace_id foreign key constraint
  UPDATE properties
  SET workspace_id = NULL
  WHERE workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = target_user_id
  );
  
  -- Step 2: Delete user_workspaces entries (memberships)
  DELETE FROM user_workspaces
  WHERE user_id = target_user_id
     OR workspace_id IN (SELECT id FROM workspaces WHERE owner_id = target_user_id);
  
  -- Step 3: Delete workspaces owned by the user
  DELETE FROM workspaces
  WHERE owner_id = target_user_id;
  
  -- Step 4: Update properties to remove user_id reference
  UPDATE properties
  SET user_id = NULL
  WHERE user_id = target_user_id;
  
  -- Step 5: Delete user profile from users table
  DELETE FROM users
  WHERE id = target_user_id;
  
  -- Step 6: Delete user from auth.users table
  -- Note: This requires admin privileges and may need to be done through Supabase dashboard
  -- or using auth.admin functions if available
  DELETE FROM auth.users
  WHERE id = target_user_id;
  
  RAISE NOTICE 'User % and all associated data have been deleted', target_user_id;
END
$$;
