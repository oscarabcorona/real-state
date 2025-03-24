import { X } from "lucide-react";
import { Appointment } from "../types";
import { getStatusClass, getStatusIcon, getStatusText } from "../utils";

interface DetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}

export function DetailsModal({
  appointment,
  onClose,
  onReschedule,
  onCancel,
}: DetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Appointment Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Property</h4>
              <p className="mt-1 text-sm text-gray-900">
                {appointment.properties.name}
              </p>
              <p className="text-sm text-gray-500">
                {appointment.properties.address}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Date & Time</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(appointment.preferred_date).toLocaleDateString()} at{" "}
                {appointment.preferred_time}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Status</h4>
              <div className="mt-1">
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
              </div>
            </div>

            {appointment.message && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Your Message
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {appointment.message}
                </p>
              </div>
            )}

            {appointment.lessor_notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Property Manager Notes
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {appointment.lessor_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            {appointment.status !== "cancelled" && (
              <>
                <button
                  onClick={onReschedule}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reschedule
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
