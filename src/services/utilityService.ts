import { supabase } from "../lib/supabase";

/**
 * Normalizes payment method strings to standard values
 */
export function normalizePaymentMethod(method: string | null): "credit_card" | "ach" | "cash" {
  switch(method?.toLowerCase()) {
    case "credit_card":
    case "credit card":
    case "card":
      return "credit_card";
    case "ach":
    case "bank":
    case "direct deposit":
    case "bank transfer":
      return "ach";
    case "cash":
    case "money":
    case "check":
      return "cash";
    default:
      // Default to credit_card if unknown
      console.warn(`Unknown payment method: ${method}, defaulting to credit_card`);
      return "credit_card";
  }
}

/**
 * Fetches property IDs associated with a tenant
 */
export async function fetchTenantPropertyIds(tenantUserId: string): Promise<string[]> {
  try {
    const { data: accessData, error: accessError } = await supabase
      .from("tenant_property_access")
      .select("property_id")
      .eq("tenant_user_id", tenantUserId);

    if (accessError) throw accessError;
    return accessData?.map((a) => a.property_id) || [];
  } catch (error) {
    console.error("Error fetching tenant property IDs:", error);
    throw error;
  }
}

/**
 * Fetches detailed property information for properties a tenant has access to
 */
export async function fetchTenantProperties(tenantUserId: string) {
  try {
    const propertyIds = await fetchTenantPropertyIds(tenantUserId);
    
    if (propertyIds.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("properties")
      .select("id, name")
      .in("id", propertyIds);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching tenant properties:", error);
    throw error;
  }
}

/**
 * Generic error handler for service functions
 */
export function handleServiceError(error: unknown, context: string): never {
  console.error(`Error in ${context}:`, error);
  throw error;
}
