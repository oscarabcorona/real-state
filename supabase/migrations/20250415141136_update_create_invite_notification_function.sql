-- Update the create_invite_notification function to handle notification types correctly
CREATE OR REPLACE FUNCTION create_invite_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name text;
  v_owner_id uuid;
  v_invite_type_display text;
  v_notification_type text;
BEGIN
  -- Get property information
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'owner_id'
  ) THEN
    SELECT 
      p.name, 
      p.owner_id
    INTO 
      v_property_name,
      v_owner_id
    FROM properties p
    WHERE p.id = NEW.property_id;
  ELSE
    SELECT 
      p.name, 
      p.user_id
    INTO 
      v_property_name,
      v_owner_id
    FROM properties p
    WHERE p.id = NEW.property_id;
  END IF;

  -- Set friendly display name for invite type
  CASE NEW.invite_type
    WHEN 'tenant' THEN v_invite_type_display := 'tenant';
    WHEN 'lawyer' THEN v_invite_type_display := 'legal advisor';
    WHEN 'contractor' THEN v_invite_type_display := 'contractor';
    WHEN 'agent' THEN v_invite_type_display := 'real estate agent';
    ELSE v_invite_type_display := 'user';
  END CASE;

  -- Check if notification_type is an enum and get appropriate value
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'notification_type'
  ) THEN
    -- If it's an enum, check if invite_sent is a valid value
    IF EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
      AND enumlabel = 'invite_sent'
    ) THEN
      v_notification_type := 'invite_sent';
    ELSE
      -- Fall back to a safe default value from the enum
      SELECT enumlabel INTO v_notification_type 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type') 
      LIMIT 1;
    END IF;
  ELSE
    -- If not an enum, just use the text value
    v_notification_type := 'invite_sent';
  END IF;

  -- Create a notification for the property owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    NEW.created_by,
    v_notification_type,
    'Property Invite Sent',
    format('You invited %s as a %s for property %s', NEW.email, v_invite_type_display, v_property_name),
    jsonb_build_object(
      'invite_id', NEW.id,
      'property_id', NEW.property_id,
      'property_name', v_property_name,
      'email', NEW.email,
      'invite_type', NEW.invite_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
