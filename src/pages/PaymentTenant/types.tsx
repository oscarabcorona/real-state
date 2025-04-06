export interface Payment {
  id: string;
  amount: number;
  payment_method: "credit_card" | "ach" | "cash";
  status: "pending" | "completed" | "failed";
  description: string;
  created_at: string;
  property_id: string;
  user_id: string;
  invoice_number: string;
  invoice_file_path: string;
  receipt_file_path: string;
  verified_at: string | null;
  verification_method: "automatic" | "manual" | null;
  payment_details: PaymentDetails | null;
  notes: string;
  properties: {
    name: string;
    user: {
      email: string;
    };
  };
}

export interface PaymentDetails {
  method: "credit_card" | "ach" | "cash";
  timestamp: string;
  info: {
    last4?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
    bank_name?: string;
    account_last4?: string;
    routing_last4?: string;
    received_by?: string;
    location?: string;
  };
}

export interface PaymentFilters {
  status: string;
  paymentMethod: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}
