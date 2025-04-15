-- Add 'invite_sent' to notification_type enum if it exists
DO $$
BEGIN
  -- Check if notification_type enum exists
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'notification_type'
  ) THEN
    -- Add 'invite_sent' to the enum if it doesn't already exist
    BEGIN
      ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'invite_sent';
    EXCEPTION
      WHEN duplicate_object THEN
        -- Value already exists, do nothing
        NULL;
    END;
  ELSE
    -- If notifications table exists but has a text type column instead of enum
    IF EXISTS (
      SELECT 1 FROM pg_tables WHERE tablename = 'notifications'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'type'
    ) THEN
      -- Nothing to do - text columns can accept any value
      RAISE NOTICE 'notifications.type is not an enum type, no changes needed';
    END IF;
  END IF;
END $$;
