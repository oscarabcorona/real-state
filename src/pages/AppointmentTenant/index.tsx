import { CalendarContainer } from "@/components/ui/calendar";
import { CalendarEvent } from "@/components/ui/calendar/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  checkTimeSlotConflicts,
  fetchTenantAppointments,
  generateTimeSlots,
  rescheduleAppointment,
  validateDate,
  validateTime,
} from "../../services/appointmentTenantService";
import { useAuthStore } from "../../store/authStore";
import { MainAppointmentsList } from "./MainAppointmentsList";
import { Appointment, RescheduleForm } from "../Calendar/types";
import { UpcomingAppointmentsSection } from "./UpcomingAppointmnetsSection";
import { RescheduleContent } from "./components/RescheduleContent";
import { CancelContent } from "./components/CancelContent";
import { Button } from "@/components/ui/button";
import { AppointmentDetailsSheet } from "@/components/appointments/AppointmentDetailsSheet";
import { CalendarDays, List } from "lucide-react";

export function AppointmentTenant() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: "",
    time: "",
    note: "",
  });
  const [cancelNote, setCancelNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeError, setTimeError] = useState("");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (rescheduleForm.date) {
      setTimeSlots(generateTimeSlots(rescheduleForm.date));
    }
  }, [rescheduleForm.date]);

  const fetchAppointments = async () => {
    try {
      const data = await fetchTenantAppointments(user?.id || "");
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert appointments to calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment &&
          appointment.preferred_date &&
          appointment.preferred_time
      )
      .map((appointment) => {
        try {
          const appointmentDate = appointment.preferred_date;
          const appointmentTime = appointment.preferred_time;

          let startDate: Date;
          try {
            startDate = parseISO(`${appointmentDate}T${appointmentTime}`);
            if (isNaN(startDate.getTime())) {
              throw new Error("Invalid date");
            }
          } catch (error) {
            console.warn(
              `Failed to parse date: ${appointmentDate} ${appointmentTime}`,
              error
            );
            startDate = new Date();
          }

          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);

          let color = "bg-blue-500";
          if (appointment.status === "confirmed") {
            color = "bg-green-500";
          } else if (appointment.status === "cancelled") {
            color = "bg-red-500";
          } else if (appointment.status === "pending") {
            color = "bg-amber-500";
          }

          const propertyTitle = appointment.properties?.name || "Property";
          const propertyAddress =
            appointment.properties?.address || "Address not available";

          return {
            id: appointment.id.toString(),
            title: `Viewing: ${propertyTitle}`,
            start: startDate,
            end: endDate,
            color,
            location: propertyAddress,
            meta: appointment,
          };
        } catch (error) {
          console.error(
            "Error converting appointment to event",
            appointment,
            error
          );
          return null;
        }
      })
      .filter(Boolean) as CalendarEvent[];
  }, [appointments]);

  const handleEventClick = (event: CalendarEvent) => {
    const appointment = event.meta as Appointment;
    setSelectedAppointment(appointment);
    setShowDetailsSheet(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);
    setTimeError("");

    try {
      const dateValidation = validateDate(rescheduleForm.date);
      if (!dateValidation.valid) {
        setTimeError(dateValidation.error || "Invalid date");
        return;
      }

      const timeValidation = validateTime(
        rescheduleForm.date,
        rescheduleForm.time
      );
      if (!timeValidation.valid) {
        setTimeError(timeValidation.error || "Invalid time");
        return;
      }

      const hasConflicts = await checkTimeSlotConflicts(
        selectedAppointment.property_id,
        selectedAppointment.id,
        rescheduleForm.date,
        rescheduleForm.time
      );

      if (hasConflicts) {
        setTimeError(
          "This time slot is already booked. Please select another time."
        );
        return;
      }

      const result = await rescheduleAppointment(
        selectedAppointment.id,
        rescheduleForm
      );

      if (result.success) {
        await fetchAppointments();
        setShowRescheduleModal(false);
        setShowDetailsSheet(false);
        setRescheduleForm({ date: "", time: "", note: "" });
        alert(result.message || "Viewing request rescheduled successfully");
      } else {
        alert(result.message || "Failed to reschedule viewing request");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      alert("Failed to reschedule viewing request");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);

    try {
      const result = await cancelAppointment(
        selectedAppointment.id,
        cancelNote
      );

      if (result.success) {
        await fetchAppointments();
        setShowCancelModal(false);
        setShowDetailsSheet(false);
        setCancelNote("");
        alert(result.message || "Viewing request cancelled successfully");
      } else {
        alert(result.message || "Failed to cancel viewing request");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel viewing request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Appointments
        </h1>
        <p className="text-muted-foreground">
          Manage your property viewing appointments
        </p>
      </div>

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "calendar" | "list")}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Viewing Calendar</h2>
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="calendar" className="m-0">
            <div className="h-[75vh] bg-background rounded-md">
              <CalendarContainer
                events={calendarEvents}
                onEventClick={handleEventClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="list" className="m-0">
            <div className="space-y-8">
              <UpcomingAppointmentsSection
                appointments={appointments}
                setSelectedAppointment={setSelectedAppointment}
                setShowDetailsSheet={setShowDetailsSheet}
              />
              <MainAppointmentsList
                appointments={appointments}
                setSelectedAppointment={setSelectedAppointment}
                setShowDetailsSheet={setShowDetailsSheet}
                setShowRescheduleModal={setShowRescheduleModal}
                setShowCancelModal={setShowCancelModal}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {selectedAppointment && (
        <AppointmentDetailsSheet
          appointment={selectedAppointment}
          userRole="tenant"
          onClose={() => setShowDetailsSheet(false)}
          onReschedule={() => {
            setShowDetailsSheet(false);
            setShowRescheduleModal(true);
          }}
          onCancel={() => {
            setShowDetailsSheet(false);
            setShowCancelModal(true);
          }}
          open={showDetailsSheet}
        />
      )}

      <Sheet open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Reschedule Appointment</SheetTitle>
            <SheetDescription>
              Change the date and time of your property viewing
            </SheetDescription>
          </SheetHeader>

          {selectedAppointment && (
            <div className="py-4">
              <RescheduleContent
                rescheduleForm={rescheduleForm}
                onUpdateForm={setRescheduleForm}
                timeError={timeError}
                timeSlots={timeSlots}
              />
            </div>
          )}

          <SheetFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={
                processing || !rescheduleForm.date || !rescheduleForm.time
              }
            >
              {processing ? "Processing..." : "Reschedule"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cancel Appointment</SheetTitle>
            <SheetDescription>
              Provide a reason for cancelling your property viewing
            </SheetDescription>
          </SheetHeader>

          {selectedAppointment && (
            <div className="py-4">
              <CancelContent
                cancelNote={cancelNote}
                onUpdateNote={setCancelNote}
              />
            </div>
          )}

          <SheetFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCancel}
              disabled={processing || !cancelNote.trim()}
              variant="destructive"
            >
              {processing ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
