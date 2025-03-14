import { addDays, format } from "date-fns";
import { Calendar } from "lucide-react";
import { Appointment } from "./tpyes";

export function UpcomingAppointmentsSection({
  appointments,
  setSelectedAppointment,
  setShowDetailsModal,
}: {
  appointments: Appointment[];
  setSelectedAppointment: (appointment: Appointment) => void;
  setShowDetailsModal: (show: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Viewings</h2>
      </div>
      <div className="p-6">
        {appointments.filter((apt) => {
          const aptDate = new Date(apt.preferred_date);
          const now = new Date();
          const nextWeek = addDays(now, 7);
          return (
            aptDate >= now && aptDate <= nextWeek && apt.status === "confirmed"
          );
        }).length === 0 ? (
          <p className="text-gray-500 text-sm">
            No upcoming viewings scheduled
          </p>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter((apt) => {
                const aptDate = new Date(apt.preferred_date);
                const now = new Date();
                const nextWeek = addDays(now, 7);
                return (
                  aptDate >= now &&
                  aptDate <= nextWeek &&
                  apt.status === "confirmed"
                );
              })
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(
                          new Date(appointment.preferred_date),
                          "MMMM d, yyyy"
                        )}{" "}
                        at {appointment.preferred_time}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.properties.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowDetailsModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
