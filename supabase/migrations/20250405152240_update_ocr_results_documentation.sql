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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_ocr_result(jsonb, text);

-- Create the validation function
CREATE OR REPLACE FUNCTION validate_ocr_result(
  p_ocr_results jsonb,
  p_document_type text
) RETURNS boolean AS $$
DECLARE
  v_is_valid boolean := true;
  v_required_fields text[];
BEGIN
  -- Define required fields based on document type
  CASE p_document_type
    WHEN 'government_id' THEN
      v_required_fields := ARRAY['full_name', 'date_of_birth', 'document_number'];
    WHEN 'credit_report' THEN
      v_required_fields := ARRAY['report_date', 'personal_info', 'credit_score'];
    WHEN 'income_verification' THEN
      v_required_fields := ARRAY['employer_name', 'position', 'salary'];
    WHEN 'criminal_report' THEN
      v_required_fields := ARRAY['report_date', 'personal_info', 'records_found'];
    WHEN 'eviction_report' THEN
      v_required_fields := ARRAY['report_date', 'personal_info', 'records_found'];
    WHEN 'lease' THEN
      v_required_fields := ARRAY['property_address', 'lease_term', 'rent_details'];
    WHEN 'bank_statements' THEN
      v_required_fields := ARRAY['bank_name', 'account_holder', 'statement_period'];
    WHEN 'employment_letter' THEN
      v_required_fields := ARRAY['employer_name', 'employee_name', 'position'];
    ELSE
      v_required_fields := ARRAY['document_type', 'is_valid'];
  END CASE;

  -- Check if all required fields are present
  FOR i IN 1..array_length(v_required_fields, 1) LOOP
    IF NOT (p_ocr_results ? v_required_fields[i]) THEN
      v_is_valid := false;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to tag OCR result type
CREATE OR REPLACE FUNCTION tag_ocr_result_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If ocr_results is not null, ensure it has a document_type field
  IF NEW.ocr_results IS NOT NULL THEN
    NEW.ocr_results := NEW.ocr_results || 
      jsonb_build_object('document_type', NEW.type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically tag OCR result type
DROP TRIGGER IF EXISTS tag_ocr_result_type_trigger ON documents;
CREATE TRIGGER tag_ocr_result_type_trigger
BEFORE INSERT OR UPDATE OF ocr_results ON documents
FOR EACH ROW
EXECUTE FUNCTION tag_ocr_result_type(); 