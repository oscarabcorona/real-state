export type Country = "USA" | "GUATEMALA" | "CANADA" | "MEXICO";

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
  created_at: string;
  updated_at: string;
  ocr_status?: "pending" | "completed" | "failed";
  ocr_error?: string;
  ocr_completed_at?: string;
  report_data?: Record<string, string | number | boolean | null>;
  previewUrl?: string;
  country: Country;
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