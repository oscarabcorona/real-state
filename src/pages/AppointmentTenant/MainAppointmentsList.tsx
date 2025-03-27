import { Appointment } from "../Calendar/types";
import { getStatusClass } from "../Calendar/utils";
import { NoAppointments } from "./components/NoAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export function MainAppointmentsList({
  appointments,
  setSelectedAppointment,
  setShowDetailsSheet,
}: {
  appointments: Appointment[];
  setSelectedAppointment: (appointment: Appointment) => void;
  setShowDetailsSheet: (show: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">All Appointments</h2>
          <p className="text-sm text-muted-foreground">
            {appointments.length}{" "}
            {appointments.length === 1 ? "appointment" : "appointments"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        {appointments.length === 0 ? (
          <div className="p-6">
            <NoAppointments />
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {appointment.properties.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getStatusClass(appointment.status)}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(appointment.preferred_date),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.preferred_time}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {appointment.name} ·{" "}
                    {appointment.documents_verified
                      ? "Documents verified"
                      : "Documents pending"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowDetailsSheet(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
