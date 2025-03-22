import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import {
  AppointmentDetailsModal,
  AppointmentList,
  CalendarView,
  UpcomingAppointments,
} from "./components";
import { Appointment } from "./types";

function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lessorNotes, setLessorNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAppointments = async () => {
    try {
      let query = supabase.from("appointments").select(`
            *,
            properties (
              name,
              address,
              city,
              state
            )
          `);

      // Filter appointments based on user role
      if (user?.role === "lessor") {
        // First get the property IDs for this lessor
        const { data: propertyData } = await supabase
          .from("properties")
          .select("id")
          .eq("user_id", user.id);

        if (propertyData && propertyData.length > 0) {
          const propertyIds = propertyData.map((p) => p.id);
          query = query.in("property_id", propertyIds);
        }
      } else if (user?.role === "tenant") {
        // For tenants, we need to:
        // 1. Get properties they have access to
        const { data: accessData } = await supabase
          .from("tenant_property_access")
          .select("property_id")
          .eq("tenant_user_id", user.id);

        if (accessData && accessData.length > 0) {
          const propertyIds = accessData.map((a) => a.property_id);
          // 2. Get appointments for those properties OR where they are the tenant
          query = query.or(
            `property_id.in.(${propertyIds}),tenant_user_id.eq.${user.id}`
          );
        } else {
          // If no property access, only get appointments they created
          query = query.eq("tenant_user_id", user.id);
        }
      }

      const { data, error } = await query.order("preferred_date", {
        ascending: true,
      });

      if (error) throw error;

      const appointments = data || [];
      setAppointments(appointments);

      // Set upcoming appointments (next 7 days)
      const now = new Date();
      const nextWeek = addDays(now, 7);
      const upcoming = appointments.filter((apt) => {
        const aptDate = new Date(apt.preferred_date);
        return (
          aptDate >= now && aptDate <= nextWeek && apt.status === "confirmed"
        );
      });
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status,
          lessor_notes: lessorNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (error) throw error;
      fetchAppointments();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setLessorNotes(appointment.lessor_notes || "");
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments Section */}
      <UpcomingAppointments
        upcomingAppointments={upcomingAppointments}
        userRole={user?.role}
        onViewDetails={handleViewDetails}
      />

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Viewing Requests</CardTitle>
            <Tabs
              defaultValue="calendar"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "calendar" | "list")
              }
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="calendar">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list">
                  <FileText className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No viewing requests</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no pending viewing requests.
              </p>
            </div>
          ) : activeTab === "calendar" ? (
            <CalendarView
              appointments={appointments}
              userRole={user?.role}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <AppointmentList
              appointments={appointments}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          userRole={user?.role}
          lessorNotes={lessorNotes}
          onLessorNotesChange={setLessorNotes}
          onClose={() => setShowDetailsModal(false)}
          onStatusChange={handleStatusChange}
          open={showDetailsModal}
        />
      )}
    </div>
  );
}

export { Appointments };
