import { endOfMonth, format, startOfMonth } from "date-fns";
import { supabase } from "../lib/supabase";
import { Payment, Property, Stats } from "../pages/DashboardLessor/types";

export interface LessorDashboardData {
  properties: Property[];
  payments: Payment[];
  stats: Stats;
  revenueChart: {
    labels: string[];
    data: number[];
  };
}

export async function fetchLessorDashboardData(
  userId: string
): Promise<LessorDashboardData> { 
  const { data: propertiesData } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_leases (
        tenant:tenants (
          name
        )
      )
    `
    )
    .eq("user_id", userId);

  const properties = propertiesData || [];

  // Calculate property stats
  const totalProperties = properties.length || 0;
  const occupiedProperties =
    properties.filter(
      (p) => p.property_leases && p.property_leases.length > 0
    ).length || 0;
  const compliantProperties =
    properties.filter((p) => p.compliance_status === "compliant").length || 0;

  // Fetch recent payments
  const { data: paymentsData } = await supabase
    .from("payments")
    .select(
      `
      *,
      properties:property_id (name)
    `
    )
    .in("property_id", properties.map((p) => p.id) || [])
    .order("created_at", { ascending: false })
    .limit(5);

  const payments = paymentsData || [];

  // Calculate payment stats
  const totalRevenue =
    payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingAmount =
    payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

  // Calculate monthly revenue for chart
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const { data: monthlyPayments } = await supabase
    .from("payments")
    .select("amount, created_at")
    .in("property_id", properties.map((p) => p.id) || [])
    .eq("status", "completed")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const dailyRevenue = new Map<string, number>();
  monthlyPayments?.forEach((payment) => {
    if (payment.created_at) {
      const date = format(new Date(payment.created_at), "MMM d");
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + payment.amount);
    }
  });

  const revenueChart = {
    labels: Array.from(dailyRevenue.keys()),
    data: Array.from(dailyRevenue.values()),
  };

  // Compile all stats
  const stats = {
    totalRevenue,
    pendingPayments: pendingAmount,
    occupancyRate:
      totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0,
    propertiesCount: totalProperties,
    tenantsCount: occupiedProperties,
    complianceRate:
      totalProperties > 0 ? (compliantProperties / totalProperties) * 100 : 0,
    upcomingViewings: 0,
    documentsToReview: 0,
  };

  // Transform data to match our interface types
  const typedProperties: Property[] = properties.map(prop => ({
    id: prop.id,
    name: prop.name,
    address: prop.address,
    city: prop.city,
    state: prop.state,
    price: prop.price,
    images: prop.images,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    square_feet: prop.square_feet,
    property_type: prop.property_type,
    compliance_status: prop.compliance_status,
    property_leases: prop.property_leases
  }));

  const typedPayments: Payment[] = payments.map(pay => ({
    id: pay.id,
    amount: pay.amount,
    status: pay.status,
    payment_method: pay.payment_method,
    created_at: pay.created_at,
    properties: pay.properties
  }));

  return {
    properties: typedProperties,
    payments: typedPayments,
    stats,
    revenueChart,
  };
}
