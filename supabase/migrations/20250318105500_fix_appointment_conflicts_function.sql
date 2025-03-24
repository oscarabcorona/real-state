/*
  # Fix Appointment Conflict Check Function

  1. Changes
    - Replace the existing check_appointment_conflicts function
    - Remove reference to non-existent "rules" record
    - Focus only on conflict checking, not validation
  
  2. Overview
    - The function only checks for overlapping appointments
    - Uses provided duration parameter without dependencies
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS check_appointment_conflicts;

-- Create a simpler fixed version that doesn't rely on external rules
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
  p_property_id uuid,
  p_date date,
  p_time time,
  p_duration_minutes integer DEFAULT 60,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  conflict_exists boolean;
BEGIN
  -- Check for existing appointments in the same time slot
  SELECT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.property_id = p_property_id
    AND a.preferred_date = p_date
    AND a.status != 'cancelled'
    AND (
      -- Exclude the current appointment if we're rescheduling
      p_exclude_appointment_id IS NULL 
      OR a.id != p_exclude_appointment_id
    )
    AND (
      -- Check if the new appointment overlaps with existing ones
      (a.preferred_time <= p_time AND a.preferred_time + (p_duration_minutes || ' minutes')::interval > p_time)
      OR
      (p_time <= a.preferred_time AND p_time + (p_duration_minutes || ' minutes')::interval > a.preferred_time)
    )
  ) INTO conflict_exists;

  RETURN conflict_exists;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_appointment_conflicts IS 'Checks if an appointment conflicts with existing appointments for a property';
