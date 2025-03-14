import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Appointment } from ".";
import { getStatusClass, getStatusIcon } from "./utils";

export function UpcomingViewings({
  appointments,
}: {
  appointments: Appointment[];
}) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Upcoming Viewings
          </h2>
          <Link
            to="/dashboard/appointments"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No upcoming viewings scheduled
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(appointment.status)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.properties.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(appointment.preferred_date),
                        "MMM d, yyyy"
                      )}{" "}
                      at {appointment.preferred_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
