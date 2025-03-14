/*
  # Add Multi-tenant Support
  
  1. New Tables
    - Create tenants table to manage multiple tenants
    - Add tenant_id to properties table
  
  2. Security
    - Enable RLS on tenants table
    - Update properties RLS policies for tenant access
    - Add policies for tenant management
  
  3. Changes
    - Modify existing properties to work with tenants
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  name text NOT NULL,
  description text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text,
  zip_code text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create tenant policies
CREATE POLICY "Users can manage their own tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add tenant_id to properties
ALTER TABLE properties
ADD COLUMN tenant_id uuid REFERENCES tenants(id);

-- Create index for tenant_id
CREATE INDEX idx_properties_tenant_id ON properties(tenant_id);

-- Update properties RLS policy to include tenant access
DROP POLICY IF EXISTS "Users can manage their own properties" ON properties;

CREATE POLICY "Users can manage properties through tenants"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Insert example tenant
DO $$ 
DECLARE 
  current_user_id uuid;
  new_tenant_id uuid;
BEGIN
  -- Get the first user from the users table as an example user
  SELECT id INTO current_user_id FROM users LIMIT 1;

  IF current_user_id IS NOT NULL THEN
    -- Create example tenant
    INSERT INTO tenants (
      user_id,
      name,
      description,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      zip_code
    ) VALUES (
      current_user_id,
      'Skyline Properties LLC',
      'Premier property management company specializing in luxury rentals',
      'contact@skylineproperties.com',
      '(555) 123-4567',
      '789 Business Ave',
      'Seattle',
      'WA',
      '98101'
    ) RETURNING id INTO new_tenant_id;

    -- Update existing properties to belong to the new tenant
    UPDATE properties 
    SET tenant_id = new_tenant_id 
    WHERE user_id = current_user_id;
  END IF;
END $$;