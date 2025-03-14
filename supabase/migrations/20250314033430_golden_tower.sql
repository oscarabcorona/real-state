/*
  # Fix document upload constraints

  1. Changes
    - Remove file path constraints that were causing issues
    - Add proper document type validation
    - Update storage policies
*/

-- Drop existing constraints that might be causing issues
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_file_size_check,
DROP CONSTRAINT IF EXISTS documents_file_type_check;

-- Update document type validation
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents
ADD CONSTRAINT documents_type_check
CHECK (type IN ('credit_report', 'criminal_report', 'eviction_report', 'income_verification'));

-- Update storage policies to be more permissive with file types
DROP POLICY IF EXISTS "Users can manage their own documents" ON storage.objects;

CREATE POLICY "Users can manage their own documents"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'tenant_documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'tenant_documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);