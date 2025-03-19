import { supabase } from "../lib/supabase";
import { Payment, PaymentFilters, Property } from "@/pages/Payments/types";
import { normalizePaymentMethod, handleServiceError } from "./utilityService";

interface PaymentStats {
  totalCollected: number;
  pending: number;
  propertiesCount: number;
  autoPayActive: number;
}

interface NewPaymentData {
  property_id: string;
  amount: string;
  payment_method: "credit_card" | "ach" | "cash";
  description: string;
}

export async function fetchUserProperties(userId: string): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id, name")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleServiceError(error, "fetchUserProperties");
  }
}

export async function fetchUserPayments(userId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        properties (name)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Map the data to ensure payment_method is properly typed
    return (data || []).map(payment => ({
      ...payment,
      // Normalize payment_method to ensure it matches our expected types
      payment_method: normalizePaymentMethod(payment.payment_method),
      // Ensure created_at is always a string
      created_at: payment.created_at || new Date().toISOString(),
      // Set defaults for potentially nullable fields
      description: payment.description || null,
      status: payment.status || "pending"
    })) as Payment[];
  } catch (error) {
    return handleServiceError(error, "fetchUserPayments");
  }
}

export function calculatePaymentStats(
  payments: Payment[],
  propertiesCount: number
): PaymentStats {
  const total =
    payments.reduce(
      (sum, payment) => (payment.status === "completed" ? sum + payment.amount : sum),
      0
    ) || 0;

  const pending =
    payments.reduce(
      (sum, payment) => (payment.status === "pending" ? sum + payment.amount : sum),
      0
    ) || 0;

  return {
    totalCollected: total,
    pending: pending,
    propertiesCount: propertiesCount,
    autoPayActive: payments.filter((p) => p.payment_method === "ach").length || 0,
  };
}

export function filterPayments(payments: Payment[], filters: PaymentFilters): Payment[] {
  let filtered = [...payments];

  if (filters.status) {
    filtered = filtered.filter((payment) => payment.status === filters.status);
  }

  if (filters.paymentMethod) {
    filtered = filtered.filter(
      (payment) => payment.payment_method === filters.paymentMethod
    );
  }

  if (filters.dateRange) {
    const now = new Date();
    const startDate = new Date();

    switch (filters.dateRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
    }

    filtered = filtered.filter(
      (payment) =>
        new Date(payment.created_at) >= startDate &&
        new Date(payment.created_at) <= now
    );
  }

  if (filters.minAmount) {
    filtered = filtered.filter(
      (payment) => payment.amount >= parseFloat(filters.minAmount)
    );
  }

  if (filters.maxAmount) {
    filtered = filtered.filter(
      (payment) => payment.amount <= parseFloat(filters.maxAmount)
    );
  }

  return filtered;
}

export async function createPayment(
  userId: string,
  paymentData: NewPaymentData
): Promise<void> {
  try {
    const { error } = await supabase.from("payments").insert([
      {
        user_id: userId,
        property_id: paymentData.property_id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        description: paymentData.description,
        status: "pending",
      },
    ]);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export function exportPaymentsToCSV(payments: Payment[]): void {
  const csvData = payments.map((payment) => ({
    Date: new Date(payment.created_at).toLocaleDateString(),
    Property: payment.properties?.name,
    Amount: payment.amount,
    Method: payment.payment_method,
    Status: payment.status,
    Description: payment.description,
  }));

  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      headers
        .map((header) => JSON.stringify(row[header as keyof typeof row]))
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `payments_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
