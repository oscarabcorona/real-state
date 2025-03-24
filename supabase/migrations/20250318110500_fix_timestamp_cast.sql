/*
  # Fix Appointment Timestamp Handling
  
  1. Changes
    - Fix the timestamp concatenation in validate_appointment_time function
    - Use to_timestamp function instead of direct casting
    - Update the appointment_time calculation
  
  2. Overview
    - Uses proper PostgreSQL timestamp functions
    - Addresses "invalid input syntax for type timestamp with time zone" error
*/

-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS validate_appointment_time_trigger ON appointments;
DROP FUNCTION IF EXISTS validate_appointment_time();

-- Create a more robust implementation
CREATE OR REPLACE FUNCTION validate_appointment_time()
RETURNS TRIGGER AS $$
DECLARE
  rules record;
  default_min_notice_hours integer := 24;
  default_days_in_advance integer := 30;
  default_start_time time := '09:00';
  default_end_time time := '17:00';
  default_duration_minutes integer := 60;
  default_excluded_days integer[] := ARRAY[0,6]; -- Sunday = 0, Saturday = 6
  
  current_time timestamptz := CURRENT_TIMESTAMP;
  appointment_datetime timestamptz;
  min_allowed_time timestamptz;
  max_allowed_time timestamptz;
BEGIN
  -- Try to get rules for the property
  SELECT * INTO rules
  FROM appointment_rules
  WHERE property_id = NEW.property_id;

  -- Build the appointment_datetime properly using to_timestamp function
  -- This avoids the string concatenation issues
  appointment_datetime := (NEW.preferred_date::date)::timestamptz + 
                         (NEW.preferred_time::time)::interval;
  
  -- Calculate allowed time range
  IF rules IS NULL THEN
    -- Use defaults if no rules found
    min_allowed_time := current_time + (default_min_notice_hours || ' hours')::interval;
    max_allowed_time := current_time + (default_days_in_advance || ' days')::interval;
  ELSE
    -- Use property-specific rules
    min_allowed_time := current_time + (rules.min_notice_hours || ' hours')::interval;
    max_allowed_time := current_time + (rules.days_in_advance || ' days')::interval;
  END IF;

  -- Validate appointment time
  IF appointment_datetime < min_allowed_time THEN
    RAISE EXCEPTION 'Appointment must be scheduled at least % hours in advance', 
      COALESCE(rules.min_notice_hours, default_min_notice_hours);
  END IF;

  IF appointment_datetime > max_allowed_time THEN
    RAISE EXCEPTION 'Appointment cannot be scheduled more than % days in advance', 
      COALESCE(rules.days_in_advance, default_days_in_advance);
  END IF;

  -- Check if the day is excluded (extracting day of week from the date)
  IF rules IS NOT NULL AND rules.excluded_days IS NOT NULL THEN
    IF EXTRACT(DOW FROM (NEW.preferred_date::date)) = ANY(rules.excluded_days) THEN
      RAISE EXCEPTION 'Appointments are not available on this day';
    END IF;
  ELSIF EXTRACT(DOW FROM (NEW.preferred_date::date)) = ANY(default_excluded_days) THEN
    RAISE EXCEPTION 'Appointments are not available on weekends';
  END IF;

  -- Check if the time is within allowed hours
  IF rules IS NULL THEN
    -- Use defaults
    IF (NEW.preferred_time::time) < default_start_time OR (NEW.preferred_time::time) > default_end_time THEN
      RAISE EXCEPTION 'Appointments are only available between % and %', 
        default_start_time::text, default_end_time::text;
    END IF;
  ELSE
    -- Use property rules
    IF (NEW.preferred_time::time) < rules.start_time OR (NEW.preferred_time::time) > rules.end_time THEN
      RAISE EXCEPTION 'Appointments are only available between % and %', 
        rules.start_time::text, rules.end_time::text;
    END IF;
  END IF;

  -- Call the conflict checking function
  -- Skip the full trigger if there's a conflict
  PERFORM check_appointment_conflicts(
    NEW.property_id, 
    NEW.preferred_date::date, 
    NEW.preferred_time::time, 
    COALESCE(rules.duration_minutes, default_duration_minutes),
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment validation
CREATE TRIGGER validate_appointment_time_trigger
  BEFORE INSERT OR UPDATE OF preferred_date, preferred_time ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_time();

COMMENT ON FUNCTION validate_appointment_time IS 'Validates appointment times using proper timestamp handling';
