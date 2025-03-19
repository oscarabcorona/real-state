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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { AnimatedElement } from "@/components/animated/AnimatedElement";

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 bg-card w-full sm:w-auto p-1 rounded-lg shadow-sm border">
          <TabsTrigger
            value="overview"
            className="text-sm font-medium px-6 py-2.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="text-sm font-medium px-6 py-2.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AnimatedElement animation="fadeIn" duration={0.5}>
            {/* Stats Overview */}
            <StatsOverview stats={stats} loading={false} />
          </AnimatedElement>

          <AnimatedElement animation="fadeIn" duration={0.5} delay={0.2}>
            {/* Revenue Chart */}
            <RevenueChart revenueChart={revenueChart} loading={false} />
          </AnimatedElement>

          <AnimatedElement animation="fadeIn" duration={0.5} delay={0.3}>
            {/* Properties Overview */}
            <PropertiesOverview properties={properties} loading={false} />
          </AnimatedElement>
        </TabsContent>

        <TabsContent value="activity">
          <AnimatedElement animation="fadeIn" duration={0.5}>
            {/* Recent Activity */}
            <RecentActivity payments={payments} loading={false} />
          </AnimatedElement>
        </TabsContent>
      </Tabs>
    </div>
  );
}
