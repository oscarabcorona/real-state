export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: "credit_report" | "criminal_report" | "eviction_report" | "income_verification" | "id_document" | "lease" | "other";
  file_path: string;
  status: "pending" | "verified" | "rejected";
  property_id?: string;
  created_at: string;
  updated_at: string;
  ocr_status?: "pending" | "completed" | "failed";
  ocr_error?: string;
  ocr_completed_at?: string;
  report_data?: Record<string, string | number | boolean | null>;
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
}

export interface DocumentRequirement {
  type: Document["type"];
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
}

export interface UploadDocumentData {
  userId: string;
  title: string;
  type: Document["type"];
  file: File;
  propertyId?: string;
}