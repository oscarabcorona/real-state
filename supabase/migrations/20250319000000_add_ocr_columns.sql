-- Add OCR-related columns to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_status text CHECK (ocr_status IN ('pending', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS ocr_error text,
ADD COLUMN IF NOT EXISTS ocr_completed_at timestamp with time zone;

-- Add comment to explain the columns
COMMENT ON COLUMN documents.ocr_status IS 'Status of OCR processing: pending, completed, or failed';
COMMENT ON COLUMN documents.ocr_error IS 'Error message if OCR processing failed';
COMMENT ON COLUMN documents.ocr_completed_at IS 'Timestamp when OCR processing completed';

-- Create index for faster queries on OCR status
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status ON documents(ocr_status); 