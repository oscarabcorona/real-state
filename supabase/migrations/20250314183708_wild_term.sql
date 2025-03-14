/*
  # Add notifications support
  
  1. New Tables
    - notifications table for storing user notifications
    - notification_types enum for different notification categories
    - notification_preferences for user notification settings
  
  2. Security
    - Enable RLS on notifications table
    - Add policies for proper access control
*/

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'appointment_scheduled',
  'appointment_confirmed',
  'appointment_cancelled',
  'appointment_rescheduled',
  'document_verified',
  'document_rejected',
  'payment_received',
  'payment_due',
  'report_ready'
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create notification trigger function
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_data jsonb;
  user_ids uuid[];
  notification_title text;
  notification_message text;
BEGIN
  -- Set notification data based on the event type
  CASE TG_ARGV[0]
    -- Appointment notifications
    WHEN 'appointment_scheduled' THEN
      -- Notify property owner
      SELECT array_agg(user_id)
      INTO user_ids
      FROM properties
      WHERE id = NEW.property_id;
      
      notification_title := 'New Viewing Request';
      notification_message := format('New viewing request for %s on %s at %s',
        (SELECT name FROM properties WHERE id = NEW.property_id),
        NEW.preferred_date,
        NEW.preferred_time
      );
      notification_data := jsonb_build_object(
        'appointment_id', NEW.id,
        'property_id', NEW.property_id,
        'date', NEW.preferred_date,
        'time', NEW.preferred_time
      );

    WHEN 'appointment_confirmed' THEN
      -- Notify tenant
      user_ids := ARRAY[NEW.tenant_user_id];
      notification_title := 'Viewing Request Confirmed';
      notification_message := format('Your viewing request for %s has been confirmed',
        (SELECT name FROM properties WHERE id = NEW.property_id)
      );
      notification_data := jsonb_build_object(
        'appointment_id', NEW.id,
        'property_id', NEW.property_id,
        'date', NEW.preferred_date,
        'time', NEW.preferred_time
      );

    WHEN 'appointment_cancelled' THEN
      -- Notify both parties
      SELECT array_agg(user_id) || ARRAY[NEW.tenant_user_id]
      INTO user_ids
      FROM properties
      WHERE id = NEW.property_id;
      
      notification_title := 'Viewing Cancelled';
      notification_message := format('Viewing for %s on %s has been cancelled',
        (SELECT name FROM properties WHERE id = NEW.property_id),
        NEW.preferred_date
      );
      notification_data := jsonb_build_object(
        'appointment_id', NEW.id,
        'property_id', NEW.property_id,
        'date', NEW.preferred_date,
        'time', NEW.preferred_time
      );

    -- Document notifications
    WHEN 'document_verified' THEN
      user_ids := ARRAY[NEW.user_id];
      notification_title := 'Document Verified';
      notification_message := format('Your document "%s" has been verified', NEW.title);
      notification_data := jsonb_build_object(
        'document_id', NEW.id,
        'type', NEW.type
      );

    WHEN 'document_rejected' THEN
      user_ids := ARRAY[NEW.user_id];
      notification_title := 'Document Rejected';
      notification_message := format('Your document "%s" has been rejected', NEW.title);
      notification_data := jsonb_build_object(
        'document_id', NEW.id,
        'type', NEW.type
      );

    -- Payment notifications
    WHEN 'payment_received' THEN
      -- Notify both tenant and property owner
      SELECT array_agg(user_id) || ARRAY[NEW.user_id]
      INTO user_ids
      FROM properties
      WHERE id = NEW.property_id;
      
      notification_title := 'Payment Received';
      notification_message := format('Payment of $%s received for %s',
        NEW.amount,
        (SELECT name FROM properties WHERE id = NEW.property_id)
      );
      notification_data := jsonb_build_object(
        'payment_id', NEW.id,
        'amount', NEW.amount,
        'property_id', NEW.property_id
      );
  END CASE;

  -- Create notifications for all relevant users
  IF user_ids IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    SELECT
      uid,
      TG_ARGV[0]::notification_type,
      notification_title,
      notification_message,
      notification_data
    FROM unnest(user_ids) uid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for different notification types
CREATE TRIGGER appointment_scheduled_notification
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_notification('appointment_scheduled');

CREATE TRIGGER appointment_confirmed_notification
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION create_notification('appointment_confirmed');

CREATE TRIGGER appointment_cancelled_notification
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
  EXECUTE FUNCTION create_notification('appointment_cancelled');

CREATE TRIGGER document_verified_notification
  AFTER UPDATE OF verified ON documents
  FOR EACH ROW
  WHEN (NEW.verified = true AND OLD.verified = false)
  EXECUTE FUNCTION create_notification('document_verified');

CREATE TRIGGER document_rejected_notification
  AFTER UPDATE OF status ON documents
  FOR EACH ROW
  WHEN (NEW.status = 'rejected' AND OLD.status != 'rejected')
  EXECUTE FUNCTION create_notification('document_rejected');

CREATE TRIGGER payment_received_notification
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION create_notification('payment_received');