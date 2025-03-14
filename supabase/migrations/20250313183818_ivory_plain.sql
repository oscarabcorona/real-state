/*
  # Add document types and enhance documents table

  1. Changes
    - Add document type check constraint
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add document type constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'documents_type_check'
  ) THEN
    ALTER TABLE documents
    ADD CONSTRAINT documents_type_check
    CHECK (type = ANY (ARRAY[
      'credit_report',
      'criminal_report',
      'eviction_report',
      'income_verification',
      'rental_application',
      'lease_agreement'
    ]::text[]));
  END IF;
END $$;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);