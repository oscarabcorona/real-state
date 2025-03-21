/*
  # Update Workspace Functions for Tier System (Fixed)
  
  1. Changes
    - Update create_default_workspace function
    - Add tier upgrade function
    - Avoid recursive triggers and policies
    
  2. Security
    - Use simpler implementation to avoid recursion
    - Maintain existing RLS policies
*/

-- Update function to create default workspace with tier
CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create workspace for lessors
  IF NEW.role = 'lessor' THEN
    -- Create default workspace with free tier
    INSERT INTO workspaces (
      name,
      description,
      owner_id,
      is_default,
      tier,
      max_properties,
      region
    ) VALUES (
      'Default Workspace',
      'Your default workspace',
      NEW.id,
      true,
      'free',
      3,
      'USA' -- Default region
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's default workspace with tier info
CREATE OR REPLACE FUNCTION get_default_workspace_with_tier(p_user_id uuid)
RETURNS TABLE(
  workspace_id uuid, 
  workspace_tier workspace_tier, 
  property_count bigint, 
  max_properties integer
) AS $$
DECLARE
  ws_record record;
BEGIN
  -- Try to find default workspace
  SELECT w.id, w.tier, w.max_properties INTO ws_record
  FROM workspaces w
  WHERE w.owner_id = p_user_id
  AND w.is_default = true
  LIMIT 1;
  
  -- If no default workspace, get any workspace
  IF ws_record.id IS NULL THEN
    SELECT w.id, w.tier, w.max_properties INTO ws_record
    FROM workspaces w
    JOIN user_workspaces uw ON uw.workspace_id = w.id
    WHERE uw.user_id = p_user_id
    LIMIT 1;
  END IF;
  
  IF ws_record.id IS NOT NULL THEN
    -- Count properties in the workspace
    SELECT 
      ws_record.id, 
      ws_record.tier,
      COUNT(p.id)::bigint,
      ws_record.max_properties
    INTO workspace_id, workspace_tier, property_count, max_properties
    FROM properties p
    WHERE p.workspace_id = ws_record.id
    GROUP BY ws_record.id, ws_record.tier, ws_record.max_properties;
    
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to upgrade workspace tier
CREATE OR REPLACE FUNCTION upgrade_workspace_tier(
  p_workspace_id uuid,
  p_new_tier workspace_tier,
  p_allowed_regions property_region[] DEFAULT NULL
) RETURNS void AS $$
DECLARE
  property_count integer;
  current_tier workspace_tier;
BEGIN
  -- Get current tier
  SELECT tier INTO current_tier
  FROM workspaces 
  WHERE id = p_workspace_id;
  
  IF current_tier IS NULL THEN
    RAISE EXCEPTION 'Workspace not found';
  END IF;
  
  -- Don't allow downgrading from higher to lower tiers
  IF current_tier = 'international' AND p_new_tier <> 'international' THEN
    RAISE EXCEPTION 'Cannot downgrade from international tier';
  END IF;
  
  IF current_tier = 'pro' AND p_new_tier NOT IN ('pro', 'international') THEN
    RAISE EXCEPTION 'Cannot downgrade from pro tier to lower tier';
  END IF;
  
  -- Validate property count for downgrade
  IF p_new_tier IN ('free', 'starter') THEN
    SELECT COUNT(*) INTO property_count 
    FROM properties 
    WHERE workspace_id = p_workspace_id;
    
    IF (p_new_tier = 'free' AND property_count > 3) OR
       (p_new_tier = 'starter' AND property_count > 10) THEN
      RAISE EXCEPTION 'Too many properties for % tier (max: %)', 
        p_new_tier, 
        CASE WHEN p_new_tier = 'free' THEN 3 ELSE 10 END;
    END IF;
  END IF;
  
  -- For pro tier, ensure at least one region is specified
  IF p_new_tier = 'pro' AND 
     (p_allowed_regions IS NULL OR array_length(p_allowed_regions, 1) IS NULL) THEN
    RAISE EXCEPTION 'Pro tier requires at least one allowed region';
  END IF;
  
  -- Update the workspace tier
  UPDATE workspaces
  SET 
    tier = p_new_tier,
    max_properties = CASE p_new_tier
      WHEN 'free' THEN 3
      WHEN 'starter' THEN 10
      WHEN 'pro' THEN NULL -- Unlimited
      WHEN 'international' THEN NULL -- Unlimited
    END,
    allowed_regions = CASE 
      WHEN p_new_tier = 'international' THEN NULL -- All regions
      WHEN p_new_tier = 'pro' THEN p_allowed_regions
      ELSE NULL -- Not applicable for free/starter
    END,
    updated_at = now()
  WHERE id = p_workspace_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get available workspace tiers for upgrade
CREATE OR REPLACE FUNCTION get_available_workspace_tiers(p_workspace_id uuid)
RETURNS TABLE(available_tier workspace_tier) AS $$
DECLARE
  current_tier workspace_tier;
BEGIN
  -- Get current tier
  SELECT tier INTO current_tier
  FROM workspaces
  WHERE id = p_workspace_id;
  
  -- Return available upgrade paths based on current tier
  CASE current_tier
    WHEN 'free' THEN
      available_tier := 'free';
      RETURN NEXT;
      available_tier := 'starter';
      RETURN NEXT;
      available_tier := 'pro';
      RETURN NEXT;
      available_tier := 'international';
      RETURN NEXT;
    WHEN 'starter' THEN
      available_tier := 'starter';
      RETURN NEXT;
      available_tier := 'pro';
      RETURN NEXT;
      available_tier := 'international';
      RETURN NEXT;
    WHEN 'pro' THEN
      available_tier := 'pro';
      RETURN NEXT;
      available_tier := 'international';
      RETURN NEXT;
    WHEN 'international' THEN
      available_tier := 'international';
      RETURN NEXT;
  END CASE;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
