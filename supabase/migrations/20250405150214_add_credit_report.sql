-- Add credit report OCR support and ensure document types include credit_report

-- Ensure credit_report is included in the documents type check constraint
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'documents_type_check'
    ) THEN
        -- Check if credit_report is already in the constraint
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname = 'documents_type_check'
            AND pg_get_constraintdef(c.oid) LIKE '%credit_report%'
        ) THEN
            -- If it doesn't exist in the constraint, recreate the constraint
            ALTER TABLE documents DROP CONSTRAINT documents_type_check;
            
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
        END IF;
    ELSE
        -- If constraint doesn't exist, create it
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
    END IF;
END $$;

-- Update or add comment explaining document types
COMMENT ON COLUMN documents.type IS 'Document types:
- credit_report: TransUnion credit report with ResidentScore
- criminal_report: National criminal background check
- eviction_report: Nationwide eviction history
- income_verification: Proof of income and employment
- id_document: Government-issued ID document
- lease: Lease agreement document
- other: Other document types';

-- Create or update document_requirements for credit reports for common countries
INSERT INTO document_requirements (country, document_type, description) 
VALUES 
    ('USA', 'credit_report', 'A credit report showing credit history, scores, and debt information'),
    ('CANADA', 'credit_report', 'Credit report with credit score and payment history'),
    ('MEXICO', 'credit_report', 'Reporte de crédito con historial de pagos')
ON CONFLICT (country, document_type) 
DO UPDATE SET 
    description = EXCLUDED.description,
    updated_at = now(); 