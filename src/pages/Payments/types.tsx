export interface Property {
  id: string;
  name: string;
}

export interface Payment {
  id: string;
  amount: number;
  payment_method: "credit_card" | "ach" | "cash";
  status: "pending" | "completed" | "failed";
  description: string;
  created_at: string;
  properties: {
    name: string;
  };
}

export interface PaymentFilters {
  status: string;
  paymentMethod: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}
