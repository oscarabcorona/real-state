-- Create a new migration for property invites

-- Add Property Invites Functionality
--
-- This migration will:
-- - Create property_invites table for sending invitations to different stakeholders
-- - Add invite_type enum for tenant, lawyer, contractor, and real estate agent roles
-- - Create functions for handling invite acceptance and permissions
-- - Set up proper relationships with properties table
-- - Add appropriate policies for property owners and invitees

-- Check if properties table exists, create if it doesn't
DO $$
DECLARE
  col_exists boolean;
BEGIN
  -- Check if properties table exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    -- Create new properties table with owner_id column
    CREATE TABLE properties (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL,
      address text,
      city text,
      state text,
      zipcode text,
      description text,
      published boolean DEFAULT false,
      created_at timestamptz DEFAULT NOW(),
      updated_at timestamptz DEFAULT NOW()
    );
    
    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own properties"
    ON properties
    FOR ALL
    USING (owner_id = auth.uid());
    
    COMMENT ON COLUMN properties.published IS 'Flag to control visibility of property to other users';
  ELSE
    -- Properties table already exists, check for columns
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'published'
    ) INTO col_exists;
    
    -- Add published column if it doesn't exist
    IF NOT col_exists THEN
      ALTER TABLE properties ADD COLUMN published boolean DEFAULT false;
      COMMENT ON COLUMN properties.published IS 'Flag to control visibility of property to other users';
    END IF;
  END IF;
END $$;

-- Create invite_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_type') THEN
    CREATE TYPE invite_type AS ENUM (
      'tenant',
      'lawyer',
      'contractor',
      'agent'
    );
  END IF;
END $$;

-- Add descriptions for each invite type
COMMENT ON TYPE invite_type IS 'Types of property invitations:
tenant - Rental tenants who live in or will live in the property
lawyer - Legal advisors with document access
contractor - Service providers with limited access
agent - Real estate agents helping with property transactions';

-- Create property_invites table
CREATE TABLE IF NOT EXISTS property_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  invite_type invite_type NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message text,
  invite_token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  -- Add a unique constraint to prevent duplicate invites
  UNIQUE(property_id, email, invite_type, status)
);

-- Enable RLS
ALTER TABLE property_invites ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_property_invites_property_id ON property_invites(property_id);
CREATE INDEX IF NOT EXISTS idx_property_invites_email ON property_invites(email);
CREATE INDEX IF NOT EXISTS idx_property_invites_status ON property_invites(status);
CREATE INDEX IF NOT EXISTS idx_property_invites_invite_type ON property_invites(invite_type);
CREATE INDEX IF NOT EXISTS idx_property_invites_invite_token ON property_invites(invite_token);

-- Create RLS policies for property_invites

-- Property owners can manage invites for their properties
DO $$
BEGIN
  -- Check if owner_id column exists in properties table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'owner_id'
  ) THEN
    EXECUTE format('
      CREATE POLICY "Property owners can manage invites"
      ON property_invites
      FOR ALL
      USING (
        created_by = auth.uid() OR
        property_id IN (
          SELECT id FROM properties
          WHERE owner_id = auth.uid()
        )
      )
    ');
  ELSE
    -- Assume user_id column is used instead
    EXECUTE format('
      CREATE POLICY "Property owners can manage invites"
      ON property_invites
      FOR ALL
      USING (
        created_by = auth.uid() OR
        property_id IN (
          SELECT id FROM properties
          WHERE user_id = auth.uid()
        )
      )
    ');
  END IF;
END
$$;

-- Users can see invites sent to their email
CREATE POLICY "Users can see invites sent to them"
ON property_invites
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create a function to handle acceptance of invites
CREATE OR REPLACE FUNCTION handle_invite_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_property_id uuid;
  v_invite_type invite_type;
  v_user_id uuid;
  v_email text;
BEGIN
  -- Only handle transitions to 'accepted' state
  IF NEW.status <> 'accepted' OR OLD.status = 'accepted' THEN
    RETURN NEW;
  END IF;
  
  v_property_id := NEW.property_id;
  v_invite_type := NEW.invite_type;
  v_email := NEW.email;
  v_user_id := (SELECT id FROM auth.users WHERE email = v_email LIMIT 1);
  
  -- Handle different invite types
  CASE v_invite_type
    WHEN 'tenant' THEN
      -- Add user as tenant in property_tenants table
      INSERT INTO property_tenants (property_id, tenant_id, status)
      VALUES (v_property_id, v_user_id, 'active')
      ON CONFLICT (property_id, tenant_id) 
      DO UPDATE SET status = 'active', updated_at = NOW();
      
    WHEN 'lawyer' THEN
      -- Add user as lawyer in property_lawyers table
      INSERT INTO property_lawyers (property_id, lawyer_id, status)
      VALUES (v_property_id, v_user_id, 'active')
      ON CONFLICT (property_id, lawyer_id) 
      DO UPDATE SET status = 'active', updated_at = NOW();
      
    WHEN 'contractor' THEN
      -- Add user as contractor in property_contractors table
      INSERT INTO property_contractors (property_id, contractor_id, status)
      VALUES (v_property_id, v_user_id, 'active')
      ON CONFLICT (property_id, contractor_id) 
      DO UPDATE SET status = 'active', updated_at = NOW();
      
    WHEN 'agent' THEN
      -- Add user as agent in property_agents table
      INSERT INTO property_agents (property_id, agent_id, status)
      VALUES (v_property_id, v_user_id, 'active')
      ON CONFLICT (property_id, agent_id) 
      DO UPDATE SET status = 'active', updated_at = NOW();
      
    ELSE
      -- Do nothing for unknown invite types
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invite acceptance
CREATE TRIGGER on_invite_acceptance
AFTER UPDATE OF status ON property_invites
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION handle_invite_acceptance();

-- Create tables for each role if they don't exist
CREATE TABLE IF NOT EXISTS property_tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS property_lawyers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, lawyer_id)
);

CREATE TABLE IF NOT EXISTS property_contractors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, contractor_id)
);

CREATE TABLE IF NOT EXISTS property_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, agent_id)
);

-- Check if notifications table exists, create if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
    CREATE TABLE notifications (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      type text NOT NULL,
      title text NOT NULL,
      message text NOT NULL,
      metadata jsonb DEFAULT '{}'::jsonb,
      read boolean DEFAULT false,
      created_at timestamptz DEFAULT NOW(),
      updated_at timestamptz DEFAULT NOW()
    );
    
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own notifications"
    ON notifications
    FOR ALL
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Create a function to generate notifications for invites
CREATE OR REPLACE FUNCTION create_invite_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name text;
  v_owner_id uuid;
  v_invite_type_display text;
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

  -- Create a notification for the property owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  ) VALUES (
    NEW.created_by,
    'invite_sent',
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

-- Create trigger for invite notifications
CREATE TRIGGER on_invite_created
AFTER INSERT ON property_invites
FOR EACH ROW
EXECUTE FUNCTION create_invite_notification();

-- Update the PropertyFormSchema to remove published field (we'll use invites instead)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'published'
  ) THEN
    COMMENT ON COLUMN properties.published IS 'Deprecated: Use property_invites instead for sharing properties.';
  END IF;
END $$;