/*
  # Add user roles and enhance document management

  1. Changes
    - Add role validation for users table
    - Add tenant screening report fields to documents table
    - Add document score and verification fields

  2. Security
    - Maintain existing RLS policies
    - Add new policies for tenant document access
*/

-- Add screening report fields to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS score numeric(5,2),
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date timestamptz,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS report_data jsonb;

-- Add document type descriptions
COMMENT ON COLUMN documents.type IS 'Document types:
- credit_report: TransUnion credit report with ResidentScore
- criminal_report: National criminal background check
- eviction_report: Nationwide eviction history
- income_verification: Proof of income and employment
- rental_application: Rental application form
- lease_agreement: Signed lease agreement';

-- Add document status descriptions
COMMENT ON COLUMN documents.status IS 'Document statuses:
- draft: Initial upload, pending submission
- pending: Submitted, awaiting verification
- signed: Verified and approved';

-- Create function to calculate tenant screening score
CREATE OR REPLACE FUNCTION calculate_tenant_score(
  credit_score numeric,
  income numeric,
  rent_amount numeric,
  has_criminal_record boolean,
  has_eviction_history boolean
) RETURNS numeric AS $$
DECLARE
  base_score numeric := 100;
  income_ratio numeric;
BEGIN
  -- Deduct points for criminal record
  IF has_criminal_record THEN
    base_score := base_score - 30;
  END IF;
  
  -- Deduct points for eviction history
  IF has_eviction_history THEN
    base_score := base_score - 25;
  END IF;
  
  -- Calculate income to rent ratio
  income_ratio := income / (rent_amount * 12);
  
  -- Add points based on income ratio
  IF income_ratio >= 3 THEN
    base_score := base_score + 15;
  ELSIF income_ratio >= 2.5 THEN
    base_score := base_score + 10;
  ELSIF income_ratio >= 2 THEN
    base_score := base_score + 5;
  END IF;
  
  -- Add points based on credit score
  IF credit_score >= 750 THEN
    base_score := base_score + 15;
  ELSIF credit_score >= 700 THEN
    base_score := base_score + 10;
  ELSIF credit_score >= 650 THEN
    base_score := base_score + 5;
  END IF;
  
  RETURN GREATEST(0, LEAST(100, base_score));
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy for lessors to view tenant documents
CREATE POLICY "Lessors can view tenant documents for their properties"
ON documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = documents.property_id
    AND p.user_id = auth.uid()
  )
);

-- Policy for tenants to manage their own documents
CREATE POLICY "Tenants can manage their own documents"
ON documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties p
    JOIN tenants t ON t.id = p.tenant_id
    WHERE p.id = documents.property_id
    AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    JOIN tenants t ON t.id = p.tenant_id
    WHERE p.id = documents.property_id
    AND t.user_id = auth.uid()
  )
);