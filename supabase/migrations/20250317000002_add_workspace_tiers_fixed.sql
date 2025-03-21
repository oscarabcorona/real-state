/*
  # Add Workspace Tiers and Regions (Fixed Implementation)
  
  1. Changes
    - Add workspace tier enum ('free', 'starter', 'pro', 'international')
    - Add region enum with all countries in the Americas
    - Update workspaces table with tier and property limits
    
  2. Security
    - Avoid potential recursion issues
    - Use simpler implementation for tier limits
*/

-- Create enum for workspace tiers
CREATE TYPE workspace_tier AS ENUM ('free', 'starter', 'pro', 'international');

-- Create enum for regions with all countries in the Americas
CREATE TYPE property_region AS ENUM (
  -- North America
  'USA', 'CANADA', 'MEXICO',
  
  -- Central America
  'BELIZE', 'GUATEMALA', 'HONDURAS', 'EL_SALVADOR', 
  'NICARAGUA', 'COSTA_RICA', 'PANAMA',
  
  -- Caribbean
  'ANTIGUA_AND_BARBUDA', 'BAHAMAS', 'BARBADOS', 'CUBA', 
  'DOMINICA', 'DOMINICAN_REPUBLIC', 'GRENADA', 'HAITI', 
  'JAMAICA', 'SAINT_KITTS_AND_NEVIS', 'SAINT_LUCIA', 
  'SAINT_VINCENT_AND_GRENADINES', 'TRINIDAD_AND_TOBAGO',
  
  -- South America
  'COLOMBIA', 'VENEZUELA', 'GUYANA', 'SURINAME', 
  'FRENCH_GUIANA', 'ECUADOR', 'PERU', 'BRAZIL', 
  'BOLIVIA', 'PARAGUAY', 'URUGUAY', 'ARGENTINA', 'CHILE'
);

-- Update workspaces table with tier information
ALTER TABLE workspaces
ADD COLUMN tier workspace_tier NOT NULL DEFAULT 'free',
ADD COLUMN max_properties integer,
ADD COLUMN allowed_regions property_region[] DEFAULT '{}'::property_region[];

-- Comment on the columns
COMMENT ON COLUMN workspaces.tier IS 'Workspace tier:
- free: Up to 3 properties
- starter: 3-10 properties
- pro: Unlimited properties in one region
- international: Unlimited properties across all regions';

COMMENT ON COLUMN workspaces.max_properties IS 'Maximum number of properties allowed in this workspace (NULL means unlimited)';

COMMENT ON COLUMN workspaces.allowed_regions IS 'Regions allowed for this workspace (empty array means all regions)';

-- Add region to properties table
ALTER TABLE properties
ADD COLUMN region property_region;

-- Simple function to set workspace limits based on tier 
-- (avoiding complex trigger implementation initially)
CREATE OR REPLACE FUNCTION update_workspace_tier_limits(
  p_workspace_id uuid, 
  p_tier workspace_tier
) RETURNS void AS $$
BEGIN
  UPDATE workspaces 
  SET 
    max_properties = CASE p_tier
      WHEN 'free' THEN 3
      WHEN 'starter' THEN 10
      WHEN 'pro' THEN NULL -- Unlimited
      WHEN 'international' THEN NULL -- Unlimited
    END
  WHERE id = p_workspace_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing workspaces with proper tier limits
UPDATE workspaces
SET 
  max_properties = CASE tier
    WHEN 'free' THEN 3
    WHEN 'starter' THEN 10
    WHEN 'pro' THEN NULL
    WHEN 'international' THEN NULL
  END
WHERE tier IS NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_tier ON workspaces(tier);
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
