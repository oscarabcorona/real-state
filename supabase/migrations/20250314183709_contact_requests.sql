/*
  # Add contact requests support
  
  1. New Table
    - contact_requests table for storing user contact form submissions
  
  2. Security
    - Enable RLS on contact_requests table
    - Add policies for proper access control
*/

-- Create contact_requests table
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('lessor', 'tenant')),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  property_count text,
  property_type text,
  move_in_date date,
  budget text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting contact requests
CREATE POLICY "Anyone can insert contact requests"
  ON contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for admins to read contact requests
CREATE POLICY "Admins can read contact requests"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin'); 