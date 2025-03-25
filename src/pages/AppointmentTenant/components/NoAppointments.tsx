import { Calendar } from "lucide-react";

interface NoAppointmentsProps {
  message?: string;
}

export function NoAppointments({
  message = "You haven't scheduled any viewings yet.",
}: NoAppointmentsProps) {
  return (
    <div className="text-center py-12">
      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No appointments
      </h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  );
}
