
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type RecommendationLevel = "strong" | "moderate" | "weak";

// Define specific types for report summary
export interface AppointmentReportSummary {
  credit_score: number;
  criminal_status: string;
  eviction_status: string;
  monthly_income: number;
  debt_to_income_ratio: number;
  employment_status: string;
  verification_date: string;
  recommendation: RecommendationLevel;
}

// Type for notification preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminders: {
    enabled: boolean;
    hours_before: number;
  };
}

// Define the property info received with an appointment
export interface AppointmentProperty {
  name: string;
  address: string;
  city: string;
  state: string;
}

// Main appointment type that aligns with database schema
export interface Appointment {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  // Make this compatible with database - it can be null, and we'll handle that in our code
  status: AppointmentStatus | null;
  documents_verified: boolean | null;
  report_summary: AppointmentReportSummary | null;
  report_id: string | null;
  lessor_notes: string | null;
  tenant_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  notification_preferences: NotificationPreferences | null;
  properties: AppointmentProperty;
  tenant_user_id: string | null;
}

// Form inputs
export interface RescheduleForm {
  date: string;
  time: string;
  note: string;
}

// Validation response type
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// More specific API response type for better error handling
export interface AppointmentActionResult {
  success: boolean;
  message?: string;
  appointment?: Appointment;
  error?: Error;
}

// Types for optimistic UI updates
export type AppointmentAction = 
  | { type: 'RESCHEDULE'; appointmentId: string; data: RescheduleForm }
  | { type: 'CANCEL'; appointmentId: string; note: string };

export type AppointmentOptimisticState = {
  loading: boolean;
  error: string | null;
  appointments: Appointment[];
};
