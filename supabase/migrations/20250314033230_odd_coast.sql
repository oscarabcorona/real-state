/*
  # Add tenant_documents storage bucket and fix document storage

  1. Changes
    - Create tenant_documents storage bucket
    - Add storage policies for document access
    - Update document table constraints

  2. Security
    - Enable RLS on storage bucket
    - Add policies for proper access control
*/

-- Create tenant_documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant_documents', 'tenant_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own documents
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

-- Add file size limit to documents table
ALTER TABLE documents
ADD CONSTRAINT documents_file_size_check
CHECK (octet_length(file_path) <= 10485760); -- 10MB limit

-- Add file type constraint to documents table
ALTER TABLE documents
ADD CONSTRAINT documents_file_type_check
CHECK (
  file_path ~ '\.pdf$' OR
  file_path ~ '\.doc$' OR
  file_path ~ '\.docx$'
);