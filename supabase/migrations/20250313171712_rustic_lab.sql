/*
  # Initial Database Setup for ShortStay Compliance Hub

  1. Tables
    - users
      - Extended user profile information
      - Stores role and user preferences
    - properties
      - Property information and compliance status
    - documents
      - Document metadata and storage
    - compliance_tasks
      - Upcoming and completed compliance tasks
    
  2. Security
    - Enable RLS on all tables
    - Set up access policies based on user roles
*/

-- Create users table with role-based access
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  compliance_status text DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed')),
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance tasks table
CREATE TABLE compliance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own compliance tasks"
  ON compliance_tasks
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_compliance_tasks_property_id ON compliance_tasks(property_id);
CREATE INDEX idx_compliance_tasks_due_date ON compliance_tasks(due_date);