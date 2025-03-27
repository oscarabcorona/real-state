import { Dispatch, SetStateAction } from "react";
import { Appointment } from "../Calendar/types";
import { getStatusClass } from "../Calendar/utils";
import { NoAppointments } from "./components/NoAppointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface MainAppointmentsListProps {
  appointments: Appointment[];
  setSelectedAppointment: Dispatch<SetStateAction<Appointment | null>>;
  setShowDetailsSheet: Dispatch<SetStateAction<boolean>>;
  setShowRescheduleModal: Dispatch<SetStateAction<boolean>>;
  setShowCancelModal: Dispatch<SetStateAction<boolean>>;
}

export function MainAppointmentsList({
  appointments,
  setSelectedAppointment,
  setShowDetailsSheet,
  setShowRescheduleModal,
  setShowCancelModal,
}: MainAppointmentsListProps) {
  const sortedAppointments = [...appointments].sort((a, b) => {
    return (
      new Date(b.preferred_date).getTime() -
      new Date(a.preferred_date).getTime()
    );
  });

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

      {appointments.length === 0 ? (
        <div className="rounded-md bg-muted/50 p-8">
          <NoAppointments />
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowDetailsSheet(true);
                    }}
                  >
                    View Details
                  </Button>
                  {new Date(appointment.preferred_date) > new Date() && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowRescheduleModal(true);
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
