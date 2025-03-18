import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { PropertiesSections } from "./PropertiesSection";
import { QuickActions } from "./QuickActions";
import { RecentDocuments } from "./RecentDocuments";
import { RecentPayments } from "./RecentPayments";
import { StatsOverview } from "./StatsOverview";
import { UpcomingViewings } from "./UpcomingViewings";
import type { Appointment, Document, Payment, Property } from "./types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

export function DashboardTenant() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pending: 0,
    propertiesCount: 0,
    autoPayActive: 0,
    documentsVerified: 0,
    documentsTotal: 0,
    upcomingViewings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      subscribeToNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get property access
      const { data: accessData } = await supabase
        .from("tenant_property_access")
        .select("property_id")
        .eq("tenant_user_id", user?.id);

      if (accessData && accessData.length > 0) {
        const propertyIds = accessData.map((a) => a.property_id);

        // Fetch properties
        const { data: propertiesData } = await supabase
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
          .in("id", propertyIds);

        setProperties(propertiesData || []);
        setStats((prev) => ({
          ...prev,
          propertiesCount: propertiesData?.length || 0,
        }));

        // Fetch payments
        const { data: paymentsData } = await supabase
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
          .limit(5);

        setPayments(paymentsData || []);

        // Calculate payment stats
        const totalPaid =
          paymentsData
            ?.filter((p) => p.status === "completed")
            .reduce((sum, p) => sum + p.amount, 0) || 0;

        const pendingPayments =
          paymentsData
            ?.filter((p) => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0) || 0;

        const autoPayActive =
          paymentsData?.filter((p) => p.payment_method === "ach").length || 0;

        setStats((prev) => ({
          ...prev,
          totalPaid,
          pending: pendingPayments,
          autoPayActive,
        }));

        // Fetch documents
        const { data: documentsData } = await supabase
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
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setDocuments(documentsData || []);

        // Calculate document stats
        const verifiedDocs =
          documentsData?.filter((d) => d.status === "signed").length || 0;
        const totalDocs = documentsData?.length || 0;

        setStats((prev) => ({
          ...prev,
          documentsVerified: verifiedDocs,
          documentsTotal: totalDocs,
        }));

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(
            `
            id,
            property_id,
            preferred_date,
            preferred_time,
            status,
            properties (
              name,
              address
            )
          `
          )
          .eq("tenant_user_id", user?.id)
          .gte("preferred_date", new Date().toISOString())
          .order("preferred_date", { ascending: true })
          .limit(5);

        setAppointments(appointmentsData || []);
        setStats((prev) => ({
          ...prev,
          upcomingViewings:
            appointmentsData?.filter((a) => a.status === "confirmed").length ||
            0,
        }));

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  if (properties.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} isLoading={loading} />
      <PropertiesSections properties={properties} isLoading={loading} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments payments={payments} isLoading={loading} />
        <RecentDocuments documents={documents} isLoading={loading} />
      </div>
      {/* Upcoming Viewings */}
      <UpcomingViewings appointments={appointments} />
      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
