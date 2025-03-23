import { useCallback, useEffect, useState } from "react";
import { Calendar } from "../../components/ui/calendar";
import { useOptimistic } from "../../hooks/useOptimisticAction";
import { supabase } from "../../lib/supabase";
import { fetchDashboardData } from "../../services/dashboardService";
import { useAuthStore } from "../../store/authStore";
import { DashboardData } from "../../types/dashboard.types";
import { PropertiesSections } from "./PropertiesSection";
import { RecentDocuments } from "./RecentDocuments";
import { RecentPayments } from "./RecentPayments";
import { StatsOverview } from "./StatsOverview";
import { UpcomingViewings } from "./UpcomingViewings";

const INITIAL_STATE: DashboardData = {
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

export function DashboardTenant() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [optimisticData, setOptimisticData] = useOptimistic(INITIAL_STATE);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchDashboardData(user.id);
      setOptimisticData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, setOptimisticData]);

  const subscribeToNotifications = useCallback(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchDashboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchDashboard]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
      const unsubscribe = subscribeToNotifications();
      return () => {
        unsubscribe?.();
      };
    }
  }, [user, fetchDashboard, subscribeToNotifications]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    console.log(`Selected date: ${date?.toLocaleDateString() || "None"}`);
  };

  return (
    <div className="space-y-6">
      <StatsOverview stats={optimisticData.stats} isLoading={loading} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertiesSections
            properties={optimisticData.properties}
            isLoading={loading}
          />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Calendar
          </h2>
          <Calendar value={selectedDate} onChange={handleDateChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments
          payments={optimisticData.payments}
          isLoading={loading}
        />
        <RecentDocuments
          documents={optimisticData.documents}
          isLoading={loading}
        />
      </div>
      <UpcomingViewings
        appointments={optimisticData.appointments}
        isLoading={loading}
      />
    </div>
  );
}
