/*
  # Create tenant documents storage bucket

  1. Changes
    - Create storage bucket for tenant documents
    - Set up proper RLS policies
    - Enable public access for document downloads

  2. Security
    - Ensure proper access control
    - Allow authenticated users to manage their documents
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'tenant_documents',
        'Tenant Documents',
        false,
        10485760,  -- 10MB limit
        ARRAY[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read tenant documents" ON storage.objects;

-- Policy for users to manage their own documents
CREATE POLICY "Users can manage their own documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'tenant_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'tenant_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for users to read tenant documents
CREATE POLICY "Users can read tenant documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'tenant_documents'
    AND (
        -- User can read their own documents
        (storage.foldername(name))[1] = auth.uid()::text
        OR
        -- Property owners can read documents for their properties
        EXISTS (
            SELECT 1 
            FROM documents d
            JOIN properties p ON p.id = d.property_id
            WHERE p.user_id = auth.uid()
            AND d.file_path = name
        )
    )
);