import { CalendarContainer } from "@/components/ui/calendar";
import { CalendarEvent } from "@/components/ui/calendar/types";
import { parseISO } from "date-fns";
import { Appointment } from "../types";

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onEventClick: (appointment: Appointment) => void;
}

export function AppointmentCalendarView({
  appointments,
  onEventClick,
}: AppointmentCalendarViewProps) {
  // Convert appointments to calendar events
  const calendarEvents: CalendarEvent[] = appointments
    .filter(
      (appointment) =>
        appointment && appointment.preferred_date && appointment.preferred_time
    )
    .map((appointment) => {
      try {
        // Create start date from preferred_date and preferred_time
        let startDate: Date;
        try {
          startDate = parseISO(
            `${appointment.preferred_date}T${appointment.preferred_time}`
          );
          if (isNaN(startDate.getTime())) {
            throw new Error("Invalid date");
          }
        } catch (error) {
          console.warn(
            `Failed to parse date: ${appointment.preferred_date} ${appointment.preferred_time}`,
            error
          );
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
    .filter(Boolean) as CalendarEvent[];

  // Handle event click in calendar
  const handleEventClick = (event: CalendarEvent) => {
    // The original appointment is stored in the meta field
    const appointment = event.meta as Appointment;
    onEventClick(appointment);
  };

  return (
    <div className="h-[80vh]">
      <CalendarContainer
        events={calendarEvents}
        onEventClick={handleEventClick}
      />
    </div>
  );
}
