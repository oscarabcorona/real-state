-- Add OCR results column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_results jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN documents.ocr_results IS 'Structured OCR results from document analysis';

-- Create GIN index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_documents_ocr_results ON documents USING GIN (ocr_results);

-- Add RLS policy to allow users to read OCR results of their own documents
CREATE POLICY "Users can read OCR results of their own documents"
ON documents
FOR SELECT
USING (
  auth.uid() = user_id
  AND ocr_results IS NOT NULL
);

-- Add RLS policy to allow service role to update OCR results
CREATE POLICY "Service role can update OCR results"
ON documents
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role'); 