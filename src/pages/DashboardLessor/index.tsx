import { endOfMonth, format, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { ProertiesOverview } from "./PropertiesOverview";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { RevenueChart } from "./RevenueChart";
import { StatsOverview } from "./StatsOverview";
import { Payment, Property } from "./types";

export function DashboardLessor() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    occupancyRate: 0,
    propertiesCount: 0,
    tenantsCount: 0,
    complianceRate: 0,
    upcomingViewings: 0,
    documentsToReview: 0,
  });
  const [revenueChart, setRevenueChart] = useState({
    labels: [] as string[],
    data: [] as number[],
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch properties with tenant info
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
        .eq("user_id", user?.id);

      setProperties(propertiesData || []);

      // Calculate property stats
      const totalProperties = propertiesData?.length || 0;
      const occupiedProperties =
        propertiesData?.filter(
          (p) => p.property_leases && p.property_leases.length > 0
        ).length || 0;
      const compliantProperties =
        propertiesData?.filter((p) => p.compliance_status === "compliant")
          .length || 0;

      // Fetch recent payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(
          `
          *,
          properties:property_id (name)
        `
        )
        .in("property_id", propertiesData?.map((p) => p.id) || [])
        .order("created_at", { ascending: false })
        .limit(5);

      setPayments(paymentsData || []);

      // Calculate payment stats
      const totalRevenue =
        paymentsData
          ?.filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingAmount =
        paymentsData
          ?.filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amount, 0) || 0;

      // Calculate monthly revenue for chart
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const { data: monthlyPayments } = await supabase
        .from("payments")
        .select("amount, created_at")
        .in("property_id", propertiesData?.map((p) => p.id) || [])
        .eq("status", "completed")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      const dailyRevenue = new Map<string, number>();
      monthlyPayments?.forEach((payment) => {
        const date = format(new Date(payment.created_at), "MMM d");
        dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + payment.amount);
      });

      setRevenueChart({
        labels: Array.from(dailyRevenue.keys()),
        data: Array.from(dailyRevenue.values()),
      });

      // Update all stats
      setStats({
        totalRevenue,
        pendingPayments: pendingAmount,
        occupancyRate:
          totalProperties > 0
            ? (occupiedProperties / totalProperties) * 100
            : 0,
        propertiesCount: totalProperties,
        tenantsCount: occupiedProperties,
        complianceRate:
          totalProperties > 0
            ? (compliantProperties / totalProperties) * 100
            : 0,
        upcomingViewings: 0,
        documentsToReview: 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Revenue Chart */}
      <RevenueChart revenueChart={revenueChart} />

      {/* Properties Overview */}
      <ProertiesOverview properties={properties} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity payments={payments} />
        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}
