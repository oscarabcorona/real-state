export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'credit_report' | 'criminal_report' | 'eviction_report' | 'income_verification';
  status: 'draft' | 'pending' | 'signed';
  file_path: string;
  created_at: string;
  updated_at: string;
  score?: number;
  verified: boolean;
  verification_date?: string;
  verified_by?: string;
  report_data?: any;
}

export interface DocumentAssignment {
  id: string;
  document_id: string;
  property_id: string;
  assigned_at: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  document?: Document;
  property?: {
    name: string;
  };
}

export interface DocumentRequirement {
  type: Document['type'];
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
}