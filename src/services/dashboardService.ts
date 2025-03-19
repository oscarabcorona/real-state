import { DashboardData } from "@/types/dashboard.types";
import { supabase } from "../lib/supabase";
import { fetchTenantPropertyIds } from "./utilityService";

export async function fetchDashboardData(
  userId: string
): Promise<DashboardData> {
  const propertyIds = await fetchTenantPropertyIds(userId);

  if (propertyIds.length === 0) {
    return {
      properties: [],
      payments: [],
      documents: [],
      appointments: [],
      stats: {
        propertiesCount: 0,
        totalPaid: 0,
        documentsVerified: 0,
        documentsTotal: 0,
        upcomingViewings: 0,
        pending: 0,
        autoPayActive: 0,
      },
    };
  }

  // Fetch all data in parallel
  const [propertiesData, paymentsData, documentsData, appointmentsData] =
    await Promise.all([
      supabase
        .from("properties")
        .select(
          `
          id,
          name,
          address,
          city,
          state,
          price,
          images,
          bedrooms,
          bathrooms,
          square_feet,
          user_id,
          property_manager:users!properties_user_id_fkey ( email )
        `
        )
        .in("id", propertyIds),
      supabase
        .from("payments")
        .select(
          `
          id,
          amount,
          status,
          payment_method,
          created_at,
          properties:property_id (name)
        `
        )
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("documents")
        .select(
          `
          id,
          title,
          type,
          status,
          created_at,
          properties:property_id (name)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("appointments")
        .select(
          `
          id,
          property_id,
          preferred_date,
          preferred_time,
          status,
          properties (name, address)
        `
        )
        .eq("tenant_user_id", userId)
        .gte("preferred_date", new Date().toISOString())
        .order("preferred_date", { ascending: true })
        .limit(5),
    ]);

  const stats = {
    totalPaid:
      paymentsData.data
        ?.filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0) || 0,
    pending:
      paymentsData.data
        ?.filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0) || 0,
    propertiesCount: propertiesData.data?.length || 0,
    autoPayActive:
      paymentsData.data?.filter((p) => p.payment_method === "ach").length || 0,
    documentsVerified:
      documentsData.data?.filter((d) => d.status === "signed").length || 0,
    documentsTotal: documentsData.data?.length || 0,
    upcomingViewings:
      appointmentsData.data?.filter((a) => a.status === "confirmed").length ||
      0,
  };

  return {
    properties: propertiesData.data || [],
    payments: paymentsData.data || [],
    documents: documentsData.data || [],
    appointments: appointmentsData.data || [],
    stats,
  };
}
