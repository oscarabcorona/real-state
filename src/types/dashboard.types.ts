import { Database } from "@/types/database.types";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

export interface Property extends Omit<PropertyRow, "created_at" | "updated_at" | "published" | "syndication" | "compliance_status" | "available_date" | "property_type" | "lease_terms" | "pet_policy" | "amenities" | "description" | "zip_code"> {
  property_manager: {
    email: string;
  } | null;
}

export interface Payment extends Pick<PaymentRow, "id" | "amount" | "status" | "payment_method" | "created_at"> {
  properties: {
    name: string;
  };
}

export interface Document extends Pick<DocumentRow, "id" | "title" | "type" | "status" | "created_at"> {
  properties: {
    name: string;
  } | null;
}

export interface Appointment extends Pick<AppointmentRow, "id" | "property_id" | "preferred_date" | "preferred_time" | "status"> {
  properties: {
    name: string;
    address: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface Stats {
  propertiesCount: number;
  totalPaid: number;
  documentsVerified: number;
  documentsTotal: number;
  upcomingViewings: number;
}

export interface DashboardData {
  properties: Property[];
  payments: Payment[];
  documents: Document[];
  appointments: Appointment[];
  stats: {
    propertiesCount: number;
    totalPaid: number;
    documentsVerified: number;
    documentsTotal: number;
    upcomingViewings: number;
    pending: number;
    autoPayActive: number;
  };
}
