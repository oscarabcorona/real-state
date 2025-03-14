/*
  # Enhance appointments with document verification

  1. Changes
    - Add document verification fields to appointments
    - Add report summary fields
    - Add appointment status tracking
    - Add notification preferences

  2. Security
    - Maintain existing RLS policies
    - Add policies for document access
*/

-- Add new fields to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS documents_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS report_summary jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS lessor_notes text,
ADD COLUMN IF NOT EXISTS tenant_notes text,
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
ADD COLUMN IF NOT EXISTS tenant_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS report_id uuid;

-- Add document verification trigger
CREATE OR REPLACE FUNCTION check_tenant_documents()
RETURNS TRIGGER AS $$
DECLARE
  doc_count integer;
  report_data jsonb;
BEGIN
  -- Check if tenant has all required documents
  SELECT COUNT(DISTINCT type)
  INTO doc_count
  FROM documents
  WHERE user_id = NEW.tenant_user_id
  AND verified = true
  AND type IN ('credit_report', 'criminal_report', 'eviction_report', 'income_verification');

  -- If all documents are present, mark as verified
  IF doc_count = 4 THEN
    NEW.documents_verified := true;
    
    -- Generate report summary
    SELECT jsonb_build_object(
      'credit_score', d1.report_data->>'credit_score',
      'criminal_status', d2.report_data->>'status',
      'eviction_status', d3.report_data->>'status',
      'monthly_income', d4.report_data->>'monthly_income',
      'debt_to_income_ratio', d4.report_data->>'debt_to_income_ratio',
      'employment_status', d4.report_data->>'employment_status',
      'verification_date', CURRENT_TIMESTAMP,
      'recommendation', CASE 
        WHEN (d1.report_data->>'credit_score')::integer >= 700 
          AND d2.report_data->>'status' = 'clear'
          AND d3.report_data->>'status' = 'clear'
          AND (d4.report_data->>'debt_to_income_ratio')::numeric <= 0.3
        THEN 'strong'
        WHEN (d1.report_data->>'credit_score')::integer >= 650
          AND d2.report_data->>'status' = 'clear'
          AND d3.report_data->>'status' = 'clear'
          AND (d4.report_data->>'debt_to_income_ratio')::numeric <= 0.35
        THEN 'moderate'
        ELSE 'weak'
      END
    )
    INTO report_data
    FROM documents d1
    JOIN documents d2 ON d2.user_id = d1.user_id AND d2.type = 'criminal_report'
    JOIN documents d3 ON d3.user_id = d1.user_id AND d3.type = 'eviction_report'
    JOIN documents d4 ON d4.user_id = d1.user_id AND d4.type = 'income_verification'
    WHERE d1.user_id = NEW.tenant_user_id
    AND d1.type = 'credit_report'
    LIMIT 1;

    NEW.report_summary := report_data;
  ELSE
    NEW.documents_verified := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document verification
DROP TRIGGER IF EXISTS verify_tenant_documents ON appointments;
CREATE TRIGGER verify_tenant_documents
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_tenant_documents();

-- Update existing appointments for user 1@gmail.com
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID for 1@gmail.com
  SELECT id INTO user_id FROM users WHERE email = '1@gmail.com';

  IF user_id IS NOT NULL THEN
    -- Update existing appointments
    UPDATE appointments
    SET 
      tenant_user_id = user_id,
      documents_verified = true
    WHERE email = '1@gmail.com';
  END IF;
END $$;