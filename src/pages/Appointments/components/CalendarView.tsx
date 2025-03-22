import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Appointment } from "../types";
import { getStatusClass } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarViewProps {
  appointments: Appointment[];
  userRole?: string;
  onViewDetails: (appointment: Appointment) => void;
}

export function CalendarView({
  appointments,
  userRole,
  onViewDetails,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const appointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) =>
      isSameDay(new Date(appointment.preferred_date), date)
    );
  };

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-muted/20 py-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayAppointments = appointmentsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`bg-card min-h-[120px] p-2 ${
                  !isSameMonth(day, currentMonth) ? "bg-muted/10" : ""
                }`}
              >
                <div className="font-medium text-sm">{format(day, "d")}</div>
                <div className="mt-1 space-y-1">
                  {dayAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      onClick={() => onViewDetails(appointment)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      <div className="font-medium truncate">
                        {userRole === "lessor"
                          ? appointment.name
                          : appointment.properties.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {appointment.preferred_time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
