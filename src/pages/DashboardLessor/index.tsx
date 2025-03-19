import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { PropertiesOverview } from "./PropertiesOverview";
import { RecentActivity } from "./RecentActivity";
import { RevenueChart } from "./RevenueChart";
import { StatsOverview } from "./StatsOverview";
import { Payment, Property, Stats, RevenueChartData } from "./types";
import {
  LessorDashboardData,
  fetchLessorDashboardData,
} from "../../services/lessorDashboardService";

export function DashboardLessor() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    pendingPayments: 0,
    occupancyRate: 0,
    propertiesCount: 0,
    tenantsCount: 0,
    complianceRate: 0,
    upcomingViewings: 0,
    documentsToReview: 0,
  });
  const [revenueChart, setRevenueChart] = useState<RevenueChartData>({
    labels: [],
    data: [],
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    // TODO: Redirect to login if user is not authenticated
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const dashboardData: LessorDashboardData = await fetchLessorDashboardData(
        user.id
      );

      setProperties(dashboardData.properties);
      setPayments(dashboardData.payments);
      setStats(dashboardData.stats);
      setRevenueChart(dashboardData.revenueChart);
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
      <StatsOverview stats={stats} loading={false} />

      {/* Revenue Chart */}
      <RevenueChart revenueChart={revenueChart} />

      {/* Properties Overview */}
      <PropertiesOverview properties={properties} loading={false} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity payments={payments} loading={false} />
      </div>
    </div>
  );
}
