-- Create an RPC function to add 'invite_sent' to notification_type enum
CREATE OR REPLACE FUNCTION add_invite_sent_to_notification_type()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if notification_type enum exists
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'notification_type'
  ) THEN
    -- Add 'invite_sent' to the enum if it doesn't already exist
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
        AND enumlabel = 'invite_sent'
      ) THEN
        ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'invite_sent';
      END IF;
      RETURN TRUE;
    EXCEPTION
      WHEN duplicate_object THEN
        -- Value already exists, consider it a success
        RETURN TRUE;
      WHEN OTHERS THEN
        -- Other errors, fail
        RAISE;
    END;
  ELSE
    -- If notification_type doesn't exist, there's nothing to do (might be using a text column)
    RETURN TRUE;
  END IF;
END;
$$;
