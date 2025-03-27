import { CalendarContainer } from "@/components/ui/calendar";
import { CalendarEvent } from "@/components/ui/calendar/types";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppointmentDetailsSheet } from "@/components/appointments/AppointmentDetailsSheet";

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
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);

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
      ) // Filter out appointments with missing date/time
      .map((appointment) => {
        try {
          // Use preferred_date and preferred_time instead of appointment_date
          const appointmentDate = appointment.preferred_date;
          const appointmentTime = appointment.preferred_time;

          // Create start date - handle parsing errors gracefully
          let startDate: Date;
          try {
            startDate = parseISO(`${appointmentDate}T${appointmentTime}`);
            // Check if date is valid
            if (isNaN(startDate.getTime())) {
              throw new Error("Invalid date");
            }
          } catch (error) {
            console.warn(
              `Failed to parse date: ${appointmentDate} ${appointmentTime}`,
              error
            );
            // Fallback to current date/time if parsing fails
            startDate = new Date();
          }

          // Create end date (assuming 1 hour duration)
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);

          // Determine color based on status
          let color = "bg-blue-500"; // default
          if (appointment.status === "confirmed") {
            color = "bg-green-500";
          } else if (appointment.status === "cancelled") {
            color = "bg-red-500";
          } else if (appointment.status === "pending") {
            color = "bg-amber-500";
          }

          // Get property information
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
            meta: appointment, // Include the original appointment for reference
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
      .filter(Boolean) as CalendarEvent[]; // Filter out any null events from failed conversions
  }, [appointments]);

  // Handle event click in calendar
  const handleEventClick = (event: CalendarEvent) => {
    // The original appointment is stored in the meta field
    const appointment = event.meta as Appointment;
    setSelectedAppointment(appointment);
    setShowDetailsSheet(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);
    setTimeError("");

    try {
      // Validate the date and time
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

      // Check for conflicts
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

      // Reschedule the appointment
      const result = await rescheduleAppointment(
        selectedAppointment.id,
        rescheduleForm
      );

      if (result.success) {
        // Refresh appointment data
        await fetchAppointments();

        // Reset and close modals
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">
          Manage your property viewing appointments
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Viewing Calendar
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowAppointmentsList(!showAppointmentsList)}
              className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {showAppointmentsList ? "Show Calendar" : "Show List View"}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {showAppointmentsList
              ? "Switch to calendar view to see appointments visually"
              : "Switch to list view to see all appointments in a list"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="mb-6" />

      {showAppointmentsList ? (
        <div className="space-y-8">
          {/* Upcoming Appointments Section */}
          <UpcomingAppointmentsSection
            appointments={appointments}
            setSelectedAppointment={setSelectedAppointment}
            setShowDetailsSheet={setShowDetailsSheet}
          />

          {/* Main Appointments List */}
          <MainAppointmentsList
            appointments={appointments}
            setSelectedAppointment={setSelectedAppointment}
            setShowDetailsSheet={setShowDetailsSheet}
            setShowRescheduleModal={setShowRescheduleModal}
            setShowCancelModal={setShowCancelModal}
          />
        </div>
      ) : (
        <div className="h-[80vh]">
          <CalendarContainer
            events={calendarEvents}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      {/* Sheets with improved layout */}
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
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setShowDetailsSheet(true);
                }}
                aria-label="Back to appointment details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div>
                <SheetTitle>Reschedule Appointment</SheetTitle>
                <SheetDescription>
                  Change the date and time of your property viewing
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedAppointment && (
            <div className="px-6 py-4 overflow-y-auto">
              <RescheduleContent
                rescheduleForm={rescheduleForm}
                onUpdateForm={setRescheduleForm}
                timeError={timeError}
                timeSlots={timeSlots}
              />
            </div>
          )}

          <SheetFooter className="px-6 py-4 border-t">
            <SheetClose asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close without saving changes</TooltipContent>
              </Tooltip>
            </SheetClose>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleReschedule}
                  disabled={
                    processing || !rescheduleForm.date || !rescheduleForm.time
                  }
                >
                  {processing ? "Processing..." : "Reschedule"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Submit your reschedule request</TooltipContent>
            </Tooltip>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => {
                  setShowCancelModal(false);
                  setShowDetailsSheet(true);
                }}
                aria-label="Back to appointment details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div>
                <SheetTitle>Cancel Appointment</SheetTitle>
                <SheetDescription>
                  Provide a reason for cancelling your property viewing
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedAppointment && (
            <div className="px-6 py-4 overflow-y-auto">
              <CancelContent
                cancelNote={cancelNote}
                onUpdateNote={setCancelNote}
              />
            </div>
          )}

          <SheetFooter className="px-6 py-4 border-t">
            <SheetClose asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Close without cancelling appointment
                </TooltipContent>
              </Tooltip>
            </SheetClose>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCancel}
                  disabled={processing || !cancelNote.trim()}
                  variant="destructive"
                >
                  {processing ? "Processing..." : "Confirm Cancellation"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Permanently cancel this appointment
              </TooltipContent>
            </Tooltip>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
