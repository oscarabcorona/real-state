export interface Appointment {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  documents_verified: boolean;
  report_summary: {
    credit_score: number;
    criminal_status: string;
    eviction_status: string;
    monthly_income: number;
    debt_to_income_ratio: number;
    employment_status: string;
    verification_date: string;
    recommendation: "strong" | "moderate" | "weak";
  } | null;
  lessor_notes: string;
  tenant_notes: string;
  created_at: string;
  properties: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  tenant_user_id: string;
}
