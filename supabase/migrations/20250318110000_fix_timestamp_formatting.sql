/*
  # Fix Timestamp Formatting in Appointment Functions

  1. Changes
    - Fix timestamp formatting in validate_appointment_time function
    - Properly handle date and time concatenation
    - Ensure correct timezone handling
  
  2. Overview
    - Addresses "invalid input syntax for type timestamp with time zone" error
    - Improves date/time handling for appointment validation
*/

-- Drop the existing function and trigger to recreate it
DROP TRIGGER IF EXISTS validate_appointment_time_trigger ON appointments;
DROP FUNCTION IF EXISTS validate_appointment_time();

-- Create updated function with fixed timestamp handling
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
  appointment_date date;
  appointment_time time;
  appointment_datetime timestamptz;
  min_allowed_time timestamptz;
  max_allowed_time timestamptz;
BEGIN
  -- Set local variables to avoid repeated access and ensure proper typing
  appointment_date := NEW.preferred_date::date;
  appointment_time := NEW.preferred_time::time;

  -- Try to get rules for the property
  SELECT * INTO rules
  FROM appointment_rules
  WHERE property_id = NEW.property_id;

  -- Construct appointment timestamp correctly
  -- Use to_timestamp to properly handle the date and time components
  appointment_datetime := (appointment_date::text || ' ' || appointment_time::text)::timestamp;
  
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

  -- Check if the day is excluded
  IF rules IS NOT NULL AND rules.excluded_days IS NOT NULL THEN
    IF EXTRACT(DOW FROM appointment_date)::integer = ANY(rules.excluded_days) THEN
      RAISE EXCEPTION 'Appointments are not available on this day';
    END IF;
  ELSIF EXTRACT(DOW FROM appointment_date)::integer = ANY(default_excluded_days) THEN
    RAISE EXCEPTION 'Appointments are not available on weekends';
  END IF;

  -- Check if the time is within allowed hours
  IF rules IS NULL THEN
    -- Use defaults
    IF appointment_time < default_start_time OR appointment_time > default_end_time THEN
      RAISE EXCEPTION 'Appointments are only available between % and %', 
        default_start_time::text, default_end_time::text;
    END IF;
  ELSE
    -- Use property rules
    IF appointment_time < rules.start_time OR appointment_time > rules.end_time THEN
      RAISE EXCEPTION 'Appointments are only available between % and %', 
        rules.start_time::text, rules.end_time::text;
    END IF;
  END IF;

  -- Check for conflicts using explicit type casting
  IF check_appointment_conflicts(
    NEW.property_id, 
    appointment_date, 
    appointment_time, 
    COALESCE(rules.duration_minutes, default_duration_minutes),
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'This time slot is already booked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment validation
CREATE TRIGGER validate_appointment_time_trigger
  BEFORE INSERT OR UPDATE OF preferred_date, preferred_time ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_time();

COMMENT ON FUNCTION validate_appointment_time IS 'Validates appointment times based on property rules or defaults with improved timestamp handling';
