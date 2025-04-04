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
  property?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
  ocr_status?: "pending" | "completed" | "failed";
  ocr_error?: string;
  ocr_completed_at?: string;
  ocr_results?: {
    document_type?: string;
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
    is_valid?: boolean;
  };
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