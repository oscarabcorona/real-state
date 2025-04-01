-- Add ocr_results column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'ocr_results'
    ) THEN
        ALTER TABLE documents ADD COLUMN ocr_results JSONB;
    END IF;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN documents.ocr_results IS 'Stores the OCR analysis results in JSON format';

-- Create GIN index for faster JSONB queries if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_documents_ocr_results'
    ) THEN
        CREATE INDEX idx_documents_ocr_results ON documents USING GIN (ocr_results);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own OCR results" ON documents;
DROP POLICY IF EXISTS "Service role can update OCR results" ON documents;

-- Add RLS policies for ocr_results
CREATE POLICY "Users can read their own OCR results"
ON documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can update OCR results"
ON documents FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role'); 