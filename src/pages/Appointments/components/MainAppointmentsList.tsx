import { Appointment } from "../../Calendar/types";
import {
  getStatusClass,
  getStatusIcon,
  getStatusText,
} from "../../Calendar/utils";
import { NoAppointments } from "./NoAppointments";

export function MainAppointmentsList({
  appointments,
  setSelectedAppointment,
  setShowDetailsModal,
  setShowRescheduleModal,
  setShowCancelModal,
}: {
  appointments: Appointment[];
  setSelectedAppointment: (appointment: Appointment) => void;
  setShowDetailsModal: (show: boolean) => void;
  setShowRescheduleModal: (show: boolean) => void;
  setShowCancelModal: (show: boolean) => void;
}) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Property Viewings</h1>
      </div>

      <div className="p-6">
        {appointments.length === 0 ? (
          <NoAppointments />
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Property
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Tenant
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">
                        {appointment.properties.name}
                      </div>
                      <div className="text-gray-500">
                        {appointment.properties.address}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">
                        {appointment.name}
                      </div>
                      <div className="text-gray-500">{appointment.email}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div>
                        {new Date(
                          appointment.preferred_date
                        ).toLocaleDateString()}
                      </div>
                      <div>{appointment.preferred_time}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">
                          {getStatusText(appointment.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        {appointment.status !== "cancelled" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowRescheduleModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowCancelModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
