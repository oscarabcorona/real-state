import { supabase } from "../lib/supabase";
import { Payment, PaymentDetails } from "@/pages/PaymentTenant/types";
import { normalizePaymentMethod, fetchTenantPropertyIds, handleServiceError } from "./utilityService";

interface PaymentFilters {
  status: string;
  paymentMethod: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}

interface PaymentStats {
  totalPaid: number;
  pending: number;
  failed: number;
}

export async function fetchTenantPayments(
  userId: string, 
  filters: PaymentFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  payments: Payment[];
  stats: PaymentStats;
  totalPages: number;
}> {
  try {
    const propertyIds = await fetchTenantPropertyIds(userId);

    if (propertyIds.length === 0) {
      return {
        payments: [],
        stats: { totalPaid: 0, pending: 0, failed: 0 },
        totalPages: 0
      };
    }

    // First, build the base query without pagination to get total count
    let baseQuery = supabase
      .from("payments")
      .select(
        `
          *,
          properties:property_id (
            name,
            user:user_id (
              email
            )
          )
        `,
        { count: 'exact' }
      )
      .in("property_id", propertyIds);

    // Apply filters
    if (filters.status) {
      baseQuery = baseQuery.eq("status", filters.status);
    }
    if (filters.paymentMethod) {
      baseQuery = baseQuery.eq("payment_method", filters.paymentMethod);
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

      baseQuery = baseQuery.gte("created_at", startDate.toISOString());
    }
    if (filters.minAmount) {
      baseQuery = baseQuery.gte("amount", parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      baseQuery = baseQuery.lte("amount", parseFloat(filters.maxAmount));
    }

    // Create a copy of the query for getting the total count
    const countQuery = baseQuery;
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    // Calculate total pages
    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    
    // Get paginated data
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    
    const { data: paymentsData, error: paymentsError } = await baseQuery
      .order("created_at", { ascending: false })
      .range(start, end);

    if (paymentsError) throw paymentsError;

    // Transform raw database records to match the Payment type
    const normalizedPayments = (paymentsData || []).map(payment => ({
      ...payment,
      // Ensure all required fields have proper values
      id: payment.id,
      amount: payment.amount,
      payment_method: normalizePaymentMethod(payment.payment_method),
      status: (payment.status || 'pending') as Payment['status'],
      description: payment.description || '',
      created_at: payment.created_at || new Date().toISOString(),
      property_id: payment.property_id,
      user_id: payment.user_id,
      invoice_number: payment.invoice_number || '',
      invoice_file_path: payment.invoice_file_path || '',
      receipt_file_path: payment.receipt_file_path || '',
      verified_at: payment.verified_at,
      verification_method: payment.verification_method as Payment['verification_method'] || null,
      payment_details: payment.payment_details || null,
      notes: payment.notes || '',
      properties: payment.properties
    })) as Payment[];

    // Get all payments for calculating stats (we need all payments, not just the paginated ones)
    const { data: allPayments, error: allPaymentsError } = await baseQuery;
    
    if (allPaymentsError) throw allPaymentsError;
    
    // Calculate stats based on all payments matching the filters
    const total =
      (allPayments || []).reduce(
        (sum, payment) =>
          payment.status === "completed" ? sum + payment.amount : sum,
        0
      ) || 0;
    const pending =
      (allPayments || []).reduce(
        (sum, payment) =>
          payment.status === "pending" ? sum + payment.amount : sum,
        0
      ) || 0;
    const failed =
      (allPayments || []).reduce(
        (sum, payment) =>
          payment.status === "failed" ? sum + payment.amount : sum,
        0
      ) || 0;

    const stats = {
      totalPaid: total,
      pending: pending,
      failed: failed,
    };

    return {
      payments: normalizedPayments,
      stats,
      totalPages
    };
  } catch (error) {
    return handleServiceError(error, "fetchTenantPayments");
  }
}

export async function processPayment(
  paymentId: string,
  paymentMethod: "credit_card" | "ach" | "cash"
): Promise<void> {
  try {
    // Create the payment details object
    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      timestamp: new Date().toISOString(),
      info:
        paymentMethod === "credit_card"
          ? {
              last4: "4242",
              brand: "visa",
              exp_month: 12,
              exp_year: 2025,
            }
          : paymentMethod === "ach"
          ? {
              bank_name: "Test Bank",
              account_last4: "1234",
              routing_last4: "5678",
            }
          : {
              received_by: "Office",
              location: "Main Office",
            },
    };

    const { error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        payment_method: paymentMethod,
        payment_details: JSON.parse(JSON.stringify(paymentDetails)),
        verified_at: new Date().toISOString(),
        verification_method: "automatic",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) throw error;
    
    // Wait for document generation (simulating async process)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
}

export async function downloadInvoice(payment: Payment): Promise<Blob> {
  if (!payment.invoice_file_path) {
    throw new Error("Invoice not available");
  }

  try {
    const { data, error } = await supabase.storage
      .from("invoices")
      .download(payment.invoice_file_path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
}
