/*
  # Rollback Workspace Tiers and Measurement Systems
  
  1. Changes
    - Drop all triggers and functions related to workspace tiers
    - Remove columns added to workspaces and properties tables
    - Drop custom types created for workspace tiers and regions
    
  2. Cleanup
    - Complete cleanup of all added elements
    - Prepare database for re-implementation
*/

-- Disable triggers if they exist to avoid errors
DO $$ 
BEGIN
  -- Check each trigger separately before disabling
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_default_workspace_trigger') THEN
    EXECUTE 'ALTER TABLE users DISABLE TRIGGER create_default_workspace_trigger';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'select_default_workspace_trigger') THEN
    EXECUTE 'ALTER TABLE users DISABLE TRIGGER select_default_workspace_trigger';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_workspace_tier_limits_trigger') THEN
    EXECUTE 'ALTER TABLE workspaces DISABLE TRIGGER set_workspace_tier_limits_trigger';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_property_measurements_trigger') THEN
    EXECUTE 'ALTER TABLE properties DISABLE TRIGGER sync_property_measurements_trigger';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_property_creation_trigger') THEN
    EXECUTE 'ALTER TABLE properties DISABLE TRIGGER validate_property_creation_trigger';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_default_measurement_system_trigger') THEN
    EXECUTE 'ALTER TABLE properties DISABLE TRIGGER set_default_measurement_system_trigger';
  END IF;
END $$;

-- Drop all triggers
DROP TRIGGER IF EXISTS set_workspace_tier_limits_trigger ON workspaces;
DROP TRIGGER IF EXISTS sync_property_measurements_trigger ON properties;
DROP TRIGGER IF EXISTS validate_property_creation_trigger ON properties;
DROP TRIGGER IF EXISTS set_default_measurement_system_trigger ON properties;

-- Drop all functions
DROP FUNCTION IF EXISTS set_workspace_tier_limits();
DROP FUNCTION IF EXISTS validate_property_creation();
DROP FUNCTION IF EXISTS set_default_measurement_system();
DROP FUNCTION IF EXISTS sync_property_measurements();
DROP FUNCTION IF EXISTS convert_sqft_to_sqm(integer);
DROP FUNCTION IF EXISTS convert_sqm_to_sqft(integer);
DROP FUNCTION IF EXISTS upgrade_workspace_tier(uuid, text, text[]);
DROP FUNCTION IF EXISTS get_available_workspace_tiers(uuid);

-- Remove columns from workspaces table
ALTER TABLE workspaces
DROP COLUMN IF EXISTS tier,
DROP COLUMN IF EXISTS max_properties,
DROP COLUMN IF EXISTS allowed_regions;

-- Remove columns from properties table
ALTER TABLE properties
DROP COLUMN IF EXISTS measurement_system,
DROP COLUMN IF EXISTS region,
DROP COLUMN IF EXISTS square_meters;

-- Drop custom types (use CASCADE to handle dependent objects)
DROP TYPE IF EXISTS workspace_tier CASCADE;
DROP TYPE IF EXISTS property_region CASCADE;
DROP TYPE IF EXISTS measurement_system CASCADE;

-- Restore default workspace creation function to its original state
CREATE OR REPLACE FUNCTION create_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'lessor' THEN
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

-- Re-enable the default workspace trigger if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_default_workspace_trigger') THEN
    EXECUTE 'ALTER TABLE users ENABLE TRIGGER create_default_workspace_trigger';
  END IF;
END $$;
