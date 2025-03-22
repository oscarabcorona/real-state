export interface Appointment {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  documents_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  lessor_notes: string | null;
  tenant_notes: string | null;
  tenant_user_id: string | null;
  notification_preferences?: Record<string, string> | null;
  report_id?: string | null;
  report_summary?: {
    credit_score?: number;
    criminal_status?: string;
    eviction_status?: string;
    monthly_income?: number;
    debt_to_income_ratio?: number;
    employment_status?: string;
    verification_date?: string;
    recommendation?: "strong" | "moderate" | "weak";
  } | null;
  properties: {
    name: string;
    address: string;
    city?: string;
    state?: string;
  };
}

// Additional type for creating new appointments
export type AppointmentCreate = Omit<
  Appointment, 
  'id' | 'created_at' | 'updated_at' | 'properties'
>;

// Type for appointment status updates
export type AppointmentStatusUpdate = {
  appointmentId: string;
  status: "confirmed" | "cancelled";
  notes?: string;
};
