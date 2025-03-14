/*
  # Fix appointment scheduling and viewing rules

  1. Changes
    - Add appointment_rules table for configurable viewing rules
    - Add conflict checking function
    - Add validation triggers
    - Update appointment policies
*/

-- Create appointment_rules table
CREATE TABLE appointment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  duration_minutes integer NOT NULL DEFAULT 60,
  days_in_advance integer NOT NULL DEFAULT 30,
  min_notice_hours integer NOT NULL DEFAULT 24,
  excluded_days integer[] DEFAULT '{0,6}', -- Sunday = 0, Saturday = 6
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id)
);

-- Function to check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
  p_property_id uuid,
  p_date date,
  p_time time,
  p_duration_minutes integer,
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

-- Function to validate appointment time
CREATE OR REPLACE FUNCTION validate_appointment_time()
RETURNS TRIGGER AS $$
DECLARE
  rules record;
  current_time timestamptz := CURRENT_TIMESTAMP;
  appointment_time timestamptz;
  min_allowed_time timestamptz;
  max_allowed_time timestamptz;
BEGIN
  -- Get rules for the property
  SELECT * INTO rules
  FROM appointment_rules
  WHERE property_id = NEW.property_id;

  -- If no specific rules exist, use defaults
  IF rules IS NULL THEN
    rules := ROW(
      NULL, NULL, '09:00'::time, '17:00'::time,
      60, 30, 24, ARRAY[0,6]::integer[]
    );
  END IF;

  -- Construct appointment timestamp
  appointment_time := (NEW.preferred_date || ' ' || NEW.preferred_time)::timestamptz;
  
  -- Calculate allowed time range
  min_allowed_time := current_time + (rules.min_notice_hours || ' hours')::interval;
  max_allowed_time := current_time + (rules.days_in_advance || ' days')::interval;

  -- Validate appointment time
  IF appointment_time < min_allowed_time THEN
    RAISE EXCEPTION 'Appointment must be scheduled at least % hours in advance', rules.min_notice_hours;
  END IF;

  IF appointment_time > max_allowed_time THEN
    RAISE EXCEPTION 'Appointment cannot be scheduled more than % days in advance', rules.days_in_advance;
  END IF;

  -- Check if the day is excluded
  IF EXTRACT(DOW FROM NEW.preferred_date)::integer = ANY(rules.excluded_days) THEN
    RAISE EXCEPTION 'Appointments are not available on this day';
  END IF;

  -- Check if the time is within allowed hours
  IF NEW.preferred_time < rules.start_time OR NEW.preferred_time > rules.end_time THEN
    RAISE EXCEPTION 'Appointments are only available between % and %', 
      rules.start_time::text, rules.end_time::text;
  END IF;

  -- Check for conflicts
  IF check_appointment_conflicts(
    NEW.property_id, 
    NEW.preferred_date, 
    NEW.preferred_time, 
    rules.duration_minutes,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'This time slot is already booked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment validation
DROP TRIGGER IF EXISTS validate_appointment_time_trigger ON appointments;
CREATE TRIGGER validate_appointment_time_trigger
  BEFORE INSERT OR UPDATE OF preferred_date, preferred_time ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_time();

-- Update appointment policies
DROP POLICY IF EXISTS "Property owners can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Tenants can view their appointments" ON appointments;

-- Policy for property owners
CREATE POLICY "Property owners can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Policy for creating appointments
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for tenants
CREATE POLICY "Tenants can view and manage their appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    tenant_user_id = auth.uid()
    OR
    email = (SELECT email FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    tenant_user_id = auth.uid()
    OR
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Insert default rules for existing properties
INSERT INTO appointment_rules (property_id)
SELECT id FROM properties
ON CONFLICT DO NOTHING;