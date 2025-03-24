/*
  # Fix Notification Row-Level Security Policies
  
  1. Changes
    - Update RLS policies for the notifications table
    - Allow notifications to be created for appointments
    - Make notifications accessible to both tenants and lessors
  
  2. Overview
    - Addresses "violates row-level security policy for table 'notifications'" error
    - Enables proper notification creation for appointments
*/

-- First drop existing RLS policy for notifications if it exists
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

-- Create a policy that allows users to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for inserting notifications - allow the system to create notifications
-- This is important for triggers that create notifications automatically
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Allow users to mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create appointment notification handling procedure to avoid RLS issues
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
  property_owner uuid;
BEGIN
  -- Get the property owner
  SELECT user_id INTO property_owner
  FROM properties
  WHERE id = NEW.property_id;
  
  -- Create notification for property owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    read
  ) VALUES (
    property_owner,
    'appointment_scheduled',
    'New Viewing Request',
    'Someone has requested to view your property',
    jsonb_build_object(
      'appointment_id', NEW.id,
      'property_id', NEW.property_id,
      'name', NEW.name,
      'email', NEW.email,
      'date', NEW.preferred_date,
      'time', NEW.preferred_time
    ),
    false
  );
  
  -- If there's a tenant_user_id, create notification for tenant too
  IF NEW.tenant_user_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      read
    ) VALUES (
      NEW.tenant_user_id,
      'appointment_scheduled',
      'Viewing Scheduled',
      'Your property viewing has been scheduled',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'property_id', NEW.property_id,
        'date', NEW.preferred_date,
        'time', NEW.preferred_time
      ),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;

-- Create the trigger with security definer function
CREATE TRIGGER appointment_notification_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION create_appointment_notification();

COMMENT ON FUNCTION create_appointment_notification IS 'Creates notifications when appointments are scheduled';
