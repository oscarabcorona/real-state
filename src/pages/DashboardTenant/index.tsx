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
import { Payment, Document, Appointment, Property } from "./types";

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

const fetchDashboardAction = async (userId: string) => {
  const { data: accessData } = await supabase
    .from("tenant_property_access")
    .select("property_id")
    .eq("tenant_user_id", userId);

  if (!accessData?.length) {
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

  const propertyIds = accessData.map((a) => a.property_id);

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
          property_manager:users!properties_user_id_fkey (
            email
          )
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

  // Calculate stats
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
};

interface DashboardData {
  properties: Property[];
  payments: Payment[];
  documents: Document[];
  appointments: Appointment[];
  stats: {
    propertiesCount: number;
    totalPaid: number;
    documentsVerified: number;
    documentsTotal: number;
    upcomingViewings: number;
    pending: number;
    autoPayActive: number;
  };
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
      const data = await fetchDashboardAction(user.id);
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
