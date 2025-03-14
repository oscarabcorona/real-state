/*
  # Refactor Documents Schema

  1. Changes
    - Make property_id nullable in documents table
    - Add document_assignments table for linking documents to properties
    - Update RLS policies for new structure
    - Add status tracking for document assignments

  2. Security
    - Maintain RLS policies for proper access control
    - Add policies for document assignments
*/

-- First make property_id nullable
ALTER TABLE documents
ALTER COLUMN property_id DROP NOT NULL;

-- Create document assignments table
CREATE TABLE document_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(document_id, property_id)
);

-- Enable RLS on document_assignments
ALTER TABLE document_assignments ENABLE ROW LEVEL SECURITY;

-- Update documents table constraints
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents
ADD CONSTRAINT documents_type_check
CHECK (type IN (
  'credit_report',
  'criminal_report',
  'eviction_report',
  'income_verification'
));

-- Add comment explaining document types
COMMENT ON COLUMN documents.type IS 'Document types:
- credit_report: TransUnion credit report with ResidentScore
- criminal_report: National criminal background check
- eviction_report: Nationwide eviction history
- income_verification: Proof of income and employment';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_assignments_document_id ON document_assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_assignments_property_id ON document_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_document_assignments_status ON document_assignments(status);

-- Update RLS policies for documents
DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;
DROP POLICY IF EXISTS "Lessors can view tenant documents for their properties" ON documents;
DROP POLICY IF EXISTS "Tenant document access" ON documents;

-- Basic document ownership policy
CREATE POLICY "Users can manage their own documents"
ON documents
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Policies for document assignments
CREATE POLICY "Users can manage their document assignments"
ON document_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_assignments.document_id
    AND documents.user_id = auth.uid()
  )
);

CREATE POLICY "Property owners can view assigned documents"
ON document_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = document_assignments.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Function to update document assignment status
CREATE OR REPLACE FUNCTION update_document_assignment_status(
  p_assignment_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE document_assignments
  SET 
    status = p_status,
    notes = COALESCE(p_notes, notes),
    updated_at = now()
  WHERE id = p_assignment_id;
END;
$$ LANGUAGE plpgsql;