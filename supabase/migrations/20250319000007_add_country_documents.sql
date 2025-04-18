/*
  # Add country-specific document types and requirements

  1. Changes
    - Add country column to documents table
    - Update document types to include country-specific requirements
    - Add document requirements table for country-specific rules

  2. Security
    - Maintain existing RLS policies
*/

-- Add country column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS country text CHECK (country IN ('USA', 'CANADA', 'MEXICO', 'GUATEMALA'));

-- First, drop the existing constraint
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_type_check;

-- Now update any existing documents with old types
UPDATE documents
SET type = 'government_id'
WHERE type = 'id_document';

-- Create document requirements table
CREATE TABLE document_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL CHECK (country IN ('USA', 'CANADA', 'MEXICO', 'GUATEMALA')),
  document_type text NOT NULL,
  description text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country, document_type)
);

-- Insert document requirements for each country
INSERT INTO document_requirements (country, document_type, description) VALUES
-- USA Requirements
('USA', 'government_id', 'Valid government-issued photo ID (driver''s license, passport, etc.)'),
('USA', 'credit_report', 'TransUnion credit report with ResidentScore'),
('USA', 'criminal_report', 'National criminal background verification'),
('USA', 'eviction_report', 'Nationwide eviction history report'),
('USA', 'income_verification', 'Proof of income and employment'),
('USA', 'lease', 'Lease agreement document'),
('USA', 'other', 'Additional supporting documents'),

-- Guatemala Requirements
('GUATEMALA', 'government_id', 'Identificación Oficial (ID)'),
('GUATEMALA', 'credit_report', 'Reporte de crédito'),
('GUATEMALA', 'criminal_report', 'Antecedentes penales y policiacos'),
('GUATEMALA', 'bank_statements', 'Últimos 3 estados de cuenta bancarios'),
('GUATEMALA', 'employment_letter', 'Carta de trabajo con salario y antigüedad'),
('GUATEMALA', 'lease', 'Contrato de arrendamiento');

-- Now add the new constraint with all possible document types
ALTER TABLE documents
ADD CONSTRAINT documents_type_check
CHECK (type IN (
  'government_id',
  'credit_report',
  'criminal_report',
  'eviction_report',
  'income_verification',
  'lease',
  'other',
  'bank_statements',
  'employment_letter',
  'id_document'  -- Keep for backward compatibility
));

-- Add comment explaining document types
COMMENT ON COLUMN documents.type IS 'Document types:
- government_id: Government-issued ID document (new)
- id_document: Government-issued ID document (legacy)
- credit_report: Credit report from authorized provider
- criminal_report: Criminal background check
- eviction_report: Eviction history report (USA only)
- income_verification: Proof of income and employment (non-Guatemala)
- bank_statements: Bank account statements (Guatemala only)
- employment_letter: Employment verification letter (Guatemala only)
- lease: Lease agreement document
- other: Other document types (not available for Guatemala)';

-- Create index for faster queries on country
CREATE INDEX IF NOT EXISTS idx_documents_country ON documents(country);

-- Create index for document requirements
CREATE INDEX IF NOT EXISTS idx_document_requirements_country ON document_requirements(country);

-- Enable RLS on document_requirements
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for document_requirements
CREATE POLICY "Anyone can read document requirements"
ON document_requirements
FOR SELECT
TO authenticated
USING (true); 