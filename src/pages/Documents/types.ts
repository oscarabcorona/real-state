export interface Document {
  id: string;
  user_id: string;
  property_id?: string;
  title: string;
  type: "credit_report" | "criminal_report" | "eviction_report" | "income_verification" | "id_document" | "lease" | "other";
  file_path: string;
  status: "pending" | "signed" | "rejected" | "draft";
  verified: boolean;
  verification_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  score?: number;
  report_data?: Record<string, string>;
  verified_by?: string;
  property?: {
    name: string;
  };
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