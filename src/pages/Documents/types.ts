export type Country = "USA" | "GUATEMALA" | "CANADA" | "MEXICO";

// Base OCR result interface with common fields
export interface BaseOcrResult {
  document_type?: string;
  is_valid?: boolean;
  result_type?: string;
  country?: Country;
}

// ID document OCR result
export interface IdDocumentOcrResult extends BaseOcrResult {
  full_name?: string;
  date_of_birth?: string;
  document_number?: string;
  expiration_date?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  additional_info?: {
    sex?: string;
    height?: string;
    weight?: string;
    eye_color?: string;
    hair_color?: string;
  };
}

// Credit report OCR result
export interface CreditReportOcrResult extends BaseOcrResult {
  report_date?: string;
  personal_info?: {
    full_name?: string;
    current_address?: string;
    previous_addresses?: string[];
    social_security?: string;
  };
  credit_score?: {
    score?: string;
    score_type?: string;
    score_range?: string;
  };
  accounts?: {
    total_accounts?: string;
    accounts_in_good_standing?: string;
    delinquent_accounts?: string;
  };
  payment_history?: {
    on_time_payments_percentage?: string;
    late_payments?: string;
  };
  derogatory_marks?: {
    collections?: string;
    public_records?: string;
    bankruptcies?: string;
  };
  credit_utilization?: string;
  inquiries?: string;
}

// Income verification OCR result
export interface IncomeVerificationOcrResult extends BaseOcrResult {
  employer_name?: string;
  position?: string;
  employment_status?: string; // full-time, part-time, contract, etc.
  start_date?: string;
  salary?: {
    amount?: string;
    frequency?: string; // annually, monthly, bi-weekly, etc.
    currency?: string;
  };
  income_history?: {
    year?: string;
    total_income?: string;
  }[];
  documentation_type?: string; // W-2, paystubs, bank statements, etc.
  verification_date?: string;
}

// Criminal report OCR result
export interface CriminalReportOcrResult extends BaseOcrResult {
  report_date?: string;
  personal_info?: {
    full_name?: string;
    date_of_birth?: string;
    social_security?: string;
  };
  records_found?: boolean;
  record_count?: string;
  conviction_details?: {
    offense?: string;
    offense_date?: string;
    offense_type?: string; // felony, misdemeanor
    disposition?: string;
    sentence?: string;
    jurisdiction?: string;
  }[];
  search_jurisdictions?: string[];
}

// Eviction report OCR result
export interface EvictionReportOcrResult extends BaseOcrResult {
  report_date?: string;
  personal_info?: {
    full_name?: string;
    current_address?: string;
    previous_addresses?: string[];
  };
  records_found?: boolean;
  eviction_count?: string;
  eviction_details?: {
    filing_date?: string;
    address?: string;
    county?: string;
    state?: string;
    plaintiff?: string;
    judgment_amount?: string;
    disposition?: string; // dismissed, judgment for plaintiff, etc.
  }[];
}

// Lease agreement OCR result
export interface LeaseOcrResult extends BaseOcrResult {
  property_address?: string;
  lease_term?: {
    start_date?: string;
    end_date?: string;
    term_length?: string;
  };
  rent_details?: {
    amount?: string;
    frequency?: string;
    currency?: string;
    due_date?: string;
    late_fee?: string;
  };
  security_deposit?: string;
  landlord_info?: {
    name?: string;
    company?: string;
    contact?: string;
  };
  tenant_info?: {
    names?: string[];
    contact?: string;
  };
  additional_terms?: string[];
  signature_date?: string;
  is_signed?: boolean;
}

// Bank statement OCR result (specific to GUATEMALA)
export interface BankStatementOcrResult extends BaseOcrResult {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  account_type?: string;
  statement_period?: {
    start_date?: string;
    end_date?: string;
  };
  opening_balance?: string;
  closing_balance?: string;
  average_balance?: string;
  currency?: string;
  transactions?: {
    total_deposits?: string;
    total_withdrawals?: string;
    transaction_count?: string;
  };
}

// Employment letter OCR result (specific to GUATEMALA)
export interface EmploymentLetterOcrResult extends BaseOcrResult {
  employer_name?: string;
  employer_address?: string;
  employee_name?: string;
  position?: string;
  employment_duration?: string;
  start_date?: string;
  salary?: {
    amount?: string;
    frequency?: string;
    currency?: string;
  };
  issuer?: {
    name?: string;
    position?: string;
    contact?: string;
  };
  issue_date?: string;
  letterhead_verified?: boolean;
  signature_verified?: boolean;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 
    | "credit_report" 
    | "criminal_report" 
    | "eviction_report" 
    | "income_verification" 
    | "government_id" 
    | "lease" 
    | "other"
    | "bank_statements"
    | "employment_letter";
  file_path: string;
  status: "pending" | "verified" | "rejected";
  property_id?: string;
  property?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
  ocr_status?: "pending" | "completed" | "failed";
  ocr_error?: string;
  ocr_completed_at?: string;
  ocr_results?: 
    | IdDocumentOcrResult 
    | CreditReportOcrResult 
    | IncomeVerificationOcrResult
    | CriminalReportOcrResult
    | EvictionReportOcrResult
    | LeaseOcrResult
    | BankStatementOcrResult
    | EmploymentLetterOcrResult;
  previewUrl?: string;
  country: Country;
  notes?: string;
  verification_date?: string;
  rejection_reason?: string;
  verified?: boolean;
}

export interface Property {
  id: string;
  name: string;
}

export interface DocumentFilters {
  type: string;
  status: string;
  dateRange: string;
  verified: string;
  country: Country;
}

export interface DocumentRequirement {
  type: Document["type"];
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  country: Country;
}

export interface UploadDocumentData {
  userId: string;
  title: string;
  type: Document["type"];
  file: File;
  propertyId?: string;
  country: Country;
}

// Type guard to check if OCR result is for ID document
export function isIdDocumentOcrResult(result: BaseOcrResult | null | undefined): result is IdDocumentOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'id_document' ||
      (
        // Fallback for older results without result_type
        'full_name' in result || 
        'date_of_birth' in result || 
        'document_number' in result
      )
    );
}

// Type guard to check if OCR result is for credit report
export function isCreditReportOcrResult(result: BaseOcrResult | null | undefined): result is CreditReportOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'credit_report' ||
      (
        // Fallback for older results without result_type
        'credit_score' in result || 
        'report_date' in result ||
        'credit_utilization' in result
      )
    );
}

// Type guard for income verification
export function isIncomeVerificationOcrResult(result: BaseOcrResult | null | undefined): result is IncomeVerificationOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'income_verification' ||
      (
        'employer_name' in result || 
        'salary' in result
      )
    );
}

// Type guard for criminal report
export function isCriminalReportOcrResult(result: BaseOcrResult | null | undefined): result is CriminalReportOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'criminal_report' ||
      (
        'records_found' in result && 
        ('record_count' in result || 'conviction_details' in result)
      )
    );
}

// Type guard for eviction report
export function isEvictionReportOcrResult(result: BaseOcrResult | null | undefined): result is EvictionReportOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'eviction_report' ||
      (
        'eviction_count' in result || 
        'eviction_details' in result
      )
    );
}

// Type guard for lease document
export function isLeaseOcrResult(result: BaseOcrResult | null | undefined): result is LeaseOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'lease' ||
      (
        'property_address' in result || 
        'lease_term' in result || 
        'rent_details' in result
      )
    );
}

// Type guard for bank statements (Guatemala)
export function isBankStatementOcrResult(result: BaseOcrResult | null | undefined): result is BankStatementOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'bank_statements' ||
      (
        'bank_name' in result || 
        'account_holder' in result || 
        'statement_period' in result
      )
    );
}

// Type guard for employment letter (Guatemala)
export function isEmploymentLetterOcrResult(result: BaseOcrResult | null | undefined): result is EmploymentLetterOcrResult {
  return result !== null && result !== undefined && 
    (
      result.result_type === 'employment_letter' ||
      (
        'employer_name' in result && 
        'issue_date' in result
      )
    );
}