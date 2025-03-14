/*
  # Add user profile fields and constraints

  1. Changes
    - Add profile fields to users table
    - Set up avatar storage
    - Add validation constraints with proper error handling

  2. Security
    - Enable RLS on storage
    - Add policies for avatar management
*/

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS bio text;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'User Avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own avatars
DROP POLICY IF EXISTS "Users can manage their own avatars" ON storage.objects;
CREATE POLICY "Users can manage their own avatars"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add constraints with proper error handling
DO $$ 
BEGIN
  -- Add phone number format validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'phone_format'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT phone_format
    CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s-\(\)]+$');
  END IF;

  -- Add ZIP code format validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'zip_code_format'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT zip_code_format
    CHECK (zip_code IS NULL OR zip_code ~ '^\d{5}(-\d{4})?$');
  END IF;

  -- Add date of birth validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'date_of_birth_valid'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT date_of_birth_valid
    CHECK (
      date_of_birth IS NULL 
      OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
    );
  END IF;
END $$;