import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { getStatusClass } from "./utils";
import { Appointment } from "../../types/dashboard.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpcomingViewings({
  appointments,
}: {
  appointments: Appointment[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Upcoming Viewings</CardTitle>
          <CardDescription>
            Schedule and manage your property visits
          </CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/appointments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-muted/50 flex h-16 w-16 items-center justify-center rounded-full">
              <Calendar className="h-8 w-8 text-muted-foreground/70" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold tracking-tight">
                No upcoming viewings
              </h3>
              <p className="text-sm text-muted-foreground">
                Schedule a viewing to get started
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/appointments/new">Schedule Viewing</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 py-4 group hover:bg-muted/50 rounded-lg px-4 transition-colors"
              >
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                    {appointment.properties.name}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={appointment.preferred_date}>
                      {format(
                        new Date(appointment.preferred_date),
                        "MMM d, yyyy"
                      )}{" "}
                      at {appointment.preferred_time}
                    </time>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
