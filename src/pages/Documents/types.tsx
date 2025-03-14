export interface Property {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type:
    | "credit_report"
    | "criminal_report"
    | "eviction_report"
    | "income_verification";
  status: "draft" | "pending" | "signed" | "rejected";
  file_path: string;
  created_at: string;
  updated_at: string;
  score?: number;
  verified: boolean;
  verification_date?: string;
  verified_by?: string;
  report_data?: Record<string, string>;
  property?: {
    name: string;
  };
  rejection_reason?: string;
  notes?: string;
}

export interface DocumentRequirement {
  type: Document["type"];
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
}
