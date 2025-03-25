import { AlertCircle, X } from "lucide-react";
import { RescheduleForm } from "../../Calendar/types";
import { VIEWING_RULES } from "../../Calendar/const";

interface RescheduleModalProps {
  rescheduleForm: RescheduleForm;
  onUpdateForm: (form: RescheduleForm) => void;
  onClose: () => void;
  onReschedule: () => void;
  processing: boolean;
  timeError: string;
  timeSlots: string[];
}

export function RescheduleModal({
  rescheduleForm,
  onUpdateForm,
  onClose,
  onReschedule,
  processing,
  timeError,
  timeSlots,
}: RescheduleModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Reschedule Viewing</h3>
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
              <label className="block text-sm font-medium text-gray-700">
                New Date
              </label>
              <input
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => {
                  const date = e.target.value;
                  onUpdateForm({ ...rescheduleForm, date, time: "" });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(
                    Date.now() +
                      VIEWING_RULES.daysInAdvance * 24 * 60 * 60 * 1000
                  )
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Viewings available Monday-Friday, up to{" "}
                {VIEWING_RULES.daysInAdvance} days in advance
              </p>
            </div>

            {rescheduleForm.date && timeSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Time
                </label>
                <select
                  value={rescheduleForm.time}
                  onChange={(e) => {
                    onUpdateForm({
                      ...rescheduleForm,
                      time: e.target.value,
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {VIEWING_RULES.duration} minute viewing slots between{" "}
                  {VIEWING_RULES.startTime} and {VIEWING_RULES.endTime}
                </p>
              </div>
            )}

            {timeError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{timeError}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Note for Property Manager
              </label>
              <textarea
                value={rescheduleForm.note}
                onChange={(e) =>
                  onUpdateForm({
                    ...rescheduleForm,
                    note: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                placeholder="Please explain why you need to reschedule..."
                required
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onReschedule}
              disabled={
                processing ||
                !rescheduleForm.date ||
                !rescheduleForm.time ||
                !rescheduleForm.note
              }
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
