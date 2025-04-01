-- Update document types to include id_document
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents
ADD CONSTRAINT documents_type_check
CHECK (type IN (
  'credit_report',
  'criminal_report',
  'eviction_report',
  'income_verification',
  'id_document',
  'lease',
  'other'
));

-- Add comment explaining document types
COMMENT ON COLUMN documents.type IS 'Document types:
- credit_report: TransUnion credit report with ResidentScore
- criminal_report: National criminal background check
- eviction_report: Nationwide eviction history
- income_verification: Proof of income and employment
- id_document: Government-issued ID document
- lease: Lease agreement document
- other: Other document types'; 