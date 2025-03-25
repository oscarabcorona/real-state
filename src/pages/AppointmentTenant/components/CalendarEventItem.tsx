import { CalendarEvent } from "@/components/ui/calendar/types";
import { format } from "date-fns";
import { Appointment } from "../../Calendar/types";
import { getStatusIcon } from "../utils";

interface CalendarEventItemProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export function CalendarEventItem({ event, onClick }: CalendarEventItemProps) {
  const appointment = event.meta as Appointment;

  return (
    <div
      className={`p-2 rounded-md cursor-pointer hover:opacity-90 ${event.color}`}
      onClick={() => onClick(event)}
    >
      <div className="flex items-center gap-2">
        {getStatusIcon(appointment.status)}
        <span className="text-white font-medium truncate">{event.title}</span>
      </div>
      <div className="text-white/90 text-xs mt-1">
        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
      </div>
      {event.location && (
        <div className="text-white/80 text-xs mt-1 truncate">
          {event.location}
        </div>
      )}
    </div>
  );
}
