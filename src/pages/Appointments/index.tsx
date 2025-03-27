import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  AppointmentList,
  CalendarView,
  UpcomingAppointments,
} from "./components";
import { AppointmentDetailsSheet } from "@/components/appointments/AppointmentDetailsSheet";
import { Appointment } from "./types";
import {
  fetchUserAppointments,
  getUpcomingAppointments,
  updateAppointmentStatus,
} from "@/services/appointmentService";

function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [lessorNotes, setLessorNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchUserAppointments(user?.id || "", user?.role);
      setAppointments(data);
      setUpcomingAppointments(getUpcomingAppointments(data));
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) => {
    try {
      await updateAppointmentStatus({
        appointmentId,
        status,
        notes: lessorNotes,
      });
      loadAppointments();
      setShowDetailsSheet(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setLessorNotes(appointment.lessor_notes || "");
    setShowDetailsSheet(true);
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
        <AppointmentDetailsSheet
          appointment={selectedAppointment}
          userRole={user?.role as "lessor" | "tenant"}
          lessorNotes={lessorNotes}
          onLessorNotesChange={setLessorNotes}
          onClose={() => setShowDetailsSheet(false)}
          onStatusChange={handleStatusChange}
          open={showDetailsSheet}
        />
      )}
    </div>
  );
}

export { Appointments };
