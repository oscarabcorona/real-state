export interface Property {
  id: string;
  name: string;
  // Add other property fields as needed
}

export interface Payment {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  payment_method: "credit_card" | "ach" | "cash" | string; // Add string to accept any value from DB
  description: string | null;
  created_at: string;
  property_id: string;
  user_id: string;
  properties?: {
    name: string;
  };
  // Add other payment fields as needed
}

export interface PaymentFilters {
  status: string;
  paymentMethod: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}
