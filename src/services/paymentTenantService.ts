import { Payment } from "@/pages/PaymentTenant/types";

export async function fetchTenantPayments(tenantId: string): Promise<Payment[]> {
  try {
    const response = await fetch(`/api/tenants/${tenantId}/payments`);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    throw error;
  }
} 