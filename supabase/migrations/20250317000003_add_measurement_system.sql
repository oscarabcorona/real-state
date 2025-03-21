/*
  # Add Measurement System Support
  
  1. Changes
    - Add measurement system enum ('imperial', 'metric')
    - Add measurement system and square_meters to properties table
    - Add conversion functions for imperial/metric measurements
    
  2. Implementation
    - Simple conversion functions
    - Optional trigger for automatic conversions
*/

-- Create enum for measurement systems
CREATE TYPE measurement_system AS ENUM ('imperial', 'metric');

-- Update properties table with measurement system support
ALTER TABLE properties
ADD COLUMN measurement_system measurement_system DEFAULT 'imperial',
ADD COLUMN square_meters integer;

-- Add comment on column
COMMENT ON COLUMN properties.measurement_system IS 'Measurement system used for this property (imperial: sq ft, metric: sq meters)';

-- Function to convert square feet to square meters
CREATE OR REPLACE FUNCTION convert_sqft_to_sqm(sqft integer) 
RETURNS integer AS $$
BEGIN
  RETURN ROUND(sqft * 0.092903);
END;
$$ LANGUAGE plpgsql;

-- Function to convert square meters to square feet
CREATE OR REPLACE FUNCTION convert_sqm_to_sqft(sqm integer) 
RETURNS integer AS $$
BEGIN
  RETURN ROUND(sqm * 10.7639);
END;
$$ LANGUAGE plpgsql;

-- Function to convert between measurement systems - without complex trigger
CREATE OR REPLACE FUNCTION convert_property_measurement(
  p_property_id uuid,
  p_target_system measurement_system
) RETURNS void AS $$
DECLARE
  v_square_feet integer;
  v_square_meters integer;
  v_current_system measurement_system;
BEGIN
  -- Get current values
  SELECT 
    square_feet, 
    square_meters,
    measurement_system
  INTO 
    v_square_feet,
    v_square_meters,
    v_current_system
  FROM properties
  WHERE id = p_property_id;

  -- Skip if already using target system
  IF v_current_system = p_target_system THEN
    RETURN;
  END IF;

  -- Convert based on target system
  IF p_target_system = 'imperial' AND v_square_meters IS NOT NULL THEN
    -- Convert to imperial
    UPDATE properties
    SET 
      measurement_system = 'imperial',
      square_feet = convert_sqm_to_sqft(v_square_meters)
    WHERE id = p_property_id;
  ELSIF p_target_system = 'metric' AND v_square_feet IS NOT NULL THEN
    -- Convert to metric
    UPDATE properties
    SET 
      measurement_system = 'metric',
      square_meters = convert_sqft_to_sqm(v_square_feet)
    WHERE id = p_property_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Calculate square_meters for existing properties with square_feet data
UPDATE properties
SET square_meters = convert_sqft_to_sqm(square_feet)
WHERE square_feet IS NOT NULL 
AND square_meters IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_measurement_system ON properties(measurement_system);
