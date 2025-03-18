import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { useCallback, useEffect, useTransition } from "react";
import { Link } from "react-router-dom";
import { useOptimistic } from "../../hooks/useOptimisticAction";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { PropertiesSections } from "./PropertiesSection";
import { QuickActions } from "./QuickActions";
import { RecentDocuments } from "./RecentDocuments";
import { RecentPayments } from "./RecentPayments";
import { StatsOverview } from "./StatsOverview";
import { UpcomingViewings } from "./UpcomingViewings";
import { fetchDashboardData } from "../../services/dashboardService";
import { DashboardData } from "../../types/dashboard.types";

export function EmptyDashboard() {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" />
        <CardTitle className="mt-4">Find Your Next Home</CardTitle>
        <CardDescription className="mt-2">
          Browse available properties and schedule viewings.
        </CardDescription>
        <Button className="mt-4" asChild>
          <Link to="/dashboard/marketplace">
            <Search className="h-4 w-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useOptimistic(INITIAL_STATE);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchDashboardData(user.id);
      startTransition(() => {
        setOptimisticData(data);
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [user?.id, startTransition, setOptimisticData]);

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
          startTransition(() => {
            fetchDashboard();
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchDashboard, startTransition]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
      const unsubscribe = subscribeToNotifications();
      return () => {
        unsubscribe?.();
      };
    }
  }, [user, fetchDashboard, subscribeToNotifications]);

  if (!optimisticData.properties.length) {
    return <EmptyDashboard />;
  }

  return (
    <div className="space-y-6">
      <StatsOverview stats={optimisticData.stats} isLoading={isPending} />
      <PropertiesSections
        properties={optimisticData.properties}
        isLoading={isPending}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments
          payments={optimisticData.payments}
          isLoading={isPending}
        />
        <RecentDocuments
          documents={optimisticData.documents}
          isLoading={isPending}
        />
      </div>
      <UpcomingViewings appointments={optimisticData.appointments} />
      <QuickActions />
    </div>
  );
}
