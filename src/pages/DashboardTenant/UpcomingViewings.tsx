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
import { Skeleton } from "@/components/ui/skeleton";

function ViewingSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function EmptyViewings() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-muted/50 flex h-16 w-16 items-center justify-center rounded-full">
        <Calendar className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold tracking-tight">No upcoming viewings</h3>
        <p className="text-sm text-muted-foreground">
          Schedule a viewing to get started
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard/appointments/new">Schedule Viewing</Link>
      </Button>
    </div>
  );
}

export function UpcomingViewings({
  appointments,
  isLoading = false,
}: {
  appointments: Appointment[] | null;
  isLoading?: boolean;
}) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <ViewingSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!appointments?.length) {
      return <EmptyViewings />;
    }

    return (
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
                {appointment.properties?.name ?? "Unnamed Property"}
              </p>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={appointment.preferred_date}>
                  {format(new Date(appointment.preferred_date), "MMM d, yyyy")}{" "}
                  at {appointment.preferred_time ?? "TBD"}
                </time>
              </div>
            </div>
            <span
              className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                appointment.status ?? "pending"
              )}`}
            >
              {appointment.status ?? "Pending"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Upcoming Viewings</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading appointments..."
              : appointments?.length
              ? "Schedule and manage your property visits"
              : "Start scheduling property viewings"}
          </CardDescription>
        </div>
        {!isLoading && appointments && appointments.length > 0 && (
          <Button variant="outline" asChild>
            <Link to="/dashboard/appointments">View All</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
