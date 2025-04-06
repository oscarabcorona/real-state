-- Add migration comment
COMMENT ON MIGRATION IS 'Update OCR results documentation to reflect typed structure for all document types';

-- Update OCR results column comment to document the expected structure based on document type
COMMENT ON COLUMN documents.ocr_results IS 'Stores the OCR analysis results in JSON format with different structures based on document type:

1. Base fields (all document types):
   - document_type: Type of document detected
   - is_valid: Whether the document appears valid and complete
   - country: Country code for country-specific document processing

2. ID Documents (government_id):
   - full_name: Full name as shown on ID
   - date_of_birth: Date of birth in YYYY-MM-DD format
   - document_number: ID number/license number
   - expiration_date: Expiration date in YYYY-MM-DD format
   - address: Object containing street, city, state, zip_code, and country
   - additional_info: Object containing sex, height, weight, eye_color, hair_color

3. Credit Reports (credit_report):
   - report_date: Date of the credit report in YYYY-MM-DD format
   - personal_info: Object containing full_name, current_address, previous_addresses, social_security
   - credit_score: Object containing score, score_type, score_range
   - accounts: Object containing total_accounts, accounts_in_good_standing, delinquent_accounts
   - payment_history: Object containing on_time_payments_percentage, late_payments
   - derogatory_marks: Object containing collections, public_records, bankruptcies
   - credit_utilization: Credit utilization percentage
   - inquiries: Number of recent inquiries

4. Income Verification (income_verification):
   - employer_name: Name of employer
   - position: Job title/position
   - employment_status: Employment status (full-time, part-time, etc.)
   - start_date: Employment start date in YYYY-MM-DD format
   - salary: Object containing amount, frequency, currency
   - income_history: Array of objects with year and total_income
   - documentation_type: Type of documentation (W-2, paystubs, etc.)
   - verification_date: Date of verification in YYYY-MM-DD format

5. Criminal Report (criminal_report):
   - report_date: Date of the report in YYYY-MM-DD format
   - personal_info: Object containing full_name, date_of_birth, social_security
   - records_found: Boolean indicating if records were found
   - record_count: Number of records found
   - conviction_details: Array of objects containing offense details
   - search_jurisdictions: Array of jurisdictions searched

6. Eviction Report (eviction_report):
   - report_date: Date of the report in YYYY-MM-DD format
   - personal_info: Object containing full_name, current_address, previous_addresses
   - records_found: Boolean indicating if records were found
   - eviction_count: Number of evictions found
   - eviction_details: Array of objects containing eviction details

7. Lease Agreement (lease):
   - property_address: Address of the property
   - lease_term: Object containing start_date, end_date, term_length
   - rent_details: Object containing amount, frequency, currency, due_date, late_fee
   - security_deposit: Amount of security deposit
   - landlord_info: Object containing name, company, contact
   - tenant_info: Object containing names array, contact
   - additional_terms: Array of additional terms
   - signature_date: Date of signature in YYYY-MM-DD format
   - is_signed: Boolean indicating if the lease is signed

8. Bank Statements (bank_statements) - GUATEMALA:
   - bank_name: Name of the bank
   - account_holder: Name of account holder
   - account_number: Account number (may be partially masked)
   - account_type: Type of account
   - statement_period: Object containing start_date and end_date
   - opening_balance: Opening balance amount
   - closing_balance: Closing balance amount
   - average_balance: Average balance during the period
   - currency: Currency code
   - transactions: Object containing total_deposits, total_withdrawals, transaction_count

9. Employment Letter (employment_letter) - GUATEMALA:
   - employer_name: Name of employer
   - employer_address: Address of employer
   - employee_name: Name of employee
   - position: Job title/position
   - employment_duration: Length of employment
   - start_date: Employment start date in YYYY-MM-DD format
   - salary: Object containing amount, frequency, currency
   - issuer: Object containing name, position, contact
   - issue_date: Date of issue in YYYY-MM-DD format
   - letterhead_verified: Boolean indicating if letterhead is verified
   - signature_verified: Boolean indicating if signature is verified';

-- Add functions to validate OCR result structures if needed
DO $$
BEGIN
  -- Check if the function already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'validate_ocr_result'
  ) THEN
    -- Create a function to validate OCR result structure
    CREATE OR REPLACE FUNCTION validate_ocr_result(result JSONB, doc_type TEXT)
    RETURNS BOOLEAN AS $$
    BEGIN
      -- Basic validation - ensure result is not null
      IF result IS NULL THEN
        RETURN FALSE;
      END IF;
      
      -- Verify it has the basic required fields
      IF NOT (result ? 'document_type') THEN
        RETURN FALSE;
      END IF;
      
      -- Document-specific validation
      CASE doc_type
        WHEN 'government_id' THEN
          -- ID document should have these fields
          RETURN (
            result ? 'full_name' OR 
            result ? 'date_of_birth' OR
            result ? 'document_number'
          );
        WHEN 'credit_report' THEN
          -- Credit report should have these fields
          RETURN (
            result ? 'credit_score' OR
            result ? 'report_date' OR
            result ? 'credit_utilization'
          );
        WHEN 'income_verification' THEN
          -- Income verification should have these fields
          RETURN (
            result ? 'employer_name' OR
            result ? 'salary'
          );
        WHEN 'criminal_report' THEN
          -- Criminal report should have these fields
          RETURN (
            result ? 'records_found' OR
            result ? 'record_count'
          );
        WHEN 'eviction_report' THEN
          -- Eviction report should have these fields
          RETURN (
            result ? 'eviction_count' OR
            result ? 'eviction_details'
          );
        WHEN 'lease' THEN
          -- Lease should have these fields
          RETURN (
            result ? 'property_address' OR
            result ? 'lease_term' OR
            result ? 'rent_details'
          );
        WHEN 'bank_statements' THEN
          -- Bank statement should have these fields
          RETURN (
            result ? 'bank_name' OR
            result ? 'account_holder' OR
            result ? 'statement_period'
          );
        WHEN 'employment_letter' THEN
          -- Employment letter should have these fields
          RETURN (
            result ? 'employer_name' AND
            result ? 'issue_date'
          );
        ELSE
          -- For other document types, just ensure it has a document_type
          RETURN TRUE;
      END CASE;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
  
  -- Create a function to tag OCR results with their document type
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'tag_ocr_result_type'
  ) THEN
    CREATE OR REPLACE FUNCTION tag_ocr_result_type()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only proceed if OCR results are being updated and not null
      IF NEW.ocr_results IS NOT NULL AND 
         (TG_OP = 'INSERT' OR OLD.ocr_results IS DISTINCT FROM NEW.ocr_results) THEN
        
        -- Add country to OCR results if missing and document has country
        IF NEW.country IS NOT NULL AND NOT (NEW.ocr_results ? 'country') THEN
          NEW.ocr_results = jsonb_set(NEW.ocr_results, '{country}', to_jsonb(NEW.country));
        END IF;
        
        -- Add a result_type field based on document type to help with client-side type guards
        CASE NEW.type
          WHEN 'government_id' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"id_document"');
          WHEN 'credit_report' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"credit_report"');
          WHEN 'income_verification' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"income_verification"');
          WHEN 'criminal_report' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"criminal_report"');
          WHEN 'eviction_report' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"eviction_report"');
          WHEN 'lease' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"lease"');
          WHEN 'bank_statements' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"bank_statements"');
          WHEN 'employment_letter' THEN
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"employment_letter"');
          ELSE
            NEW.ocr_results = jsonb_set(NEW.ocr_results, '{result_type}', '"other"');
        END CASE;

        -- Validate the OCR result structure based on document type
        IF NOT validate_ocr_result(NEW.ocr_results, NEW.type) THEN
          -- Log warning but allow operation to continue
          RAISE WARNING 'OCR result structure for document ID % does not match expected format for type %', 
                        NEW.id, NEW.type;
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create or replace the trigger for tagging OCR results
DROP TRIGGER IF EXISTS tag_ocr_result_type_trigger ON documents;

CREATE TRIGGER tag_ocr_result_type_trigger
BEFORE INSERT OR UPDATE OF ocr_results ON documents
FOR EACH ROW
EXECUTE FUNCTION tag_ocr_result_type(); 