import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Appointment } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingAppointmentsProps {
  upcomingAppointments: Appointment[];
  userRole?: string;
  onViewDetails: (appointment: Appointment) => void;
}

export function UpcomingAppointments({
  upcomingAppointments,
  userRole,
  onViewDetails,
}: UpcomingAppointmentsProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b pb-3">
        <CardTitle>Upcoming Viewings</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {upcomingAppointments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No upcoming viewings scheduled
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-accent/20 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(appointment.preferred_date),
                        "MMMM d, yyyy"
                      )}{" "}
                      at {appointment.preferred_time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userRole === "lessor"
                        ? appointment.name
                        : appointment.properties.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(appointment)}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
