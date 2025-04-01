-- Update storage bucket configuration to allow common image formats
UPDATE storage.buckets
SET allowed_mime_types = array[
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf'
]
WHERE id = 'tenant_documents';

-- Ensure the bucket exists and create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'tenant_documents'
    ) THEN
        INSERT INTO storage.buckets (id, name, allowed_mime_types)
        VALUES (
            'tenant_documents',
            'tenant_documents',
            array[
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'application/pdf'
            ]
        );
    END IF;
END $$; 