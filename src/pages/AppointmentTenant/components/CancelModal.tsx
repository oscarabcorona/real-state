import { X } from "lucide-react";

interface CancelModalProps {
  cancelNote: string;
  onUpdateNote: (note: string) => void;
  onClose: () => void;
  onCancel: () => void;
  processing: boolean;
}

export function CancelModal({
  cancelNote,
  onUpdateNote,
  onClose,
  onCancel,
  processing,
}: CancelModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Cancel Viewing</h3>
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
            <p className="text-sm text-gray-500">
              Are you sure you want to cancel this viewing? This action cannot
              be undone.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Note for Property Manager
              </label>
              <textarea
                value={cancelNote}
                onChange={(e) => onUpdateNote(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                placeholder="Please explain why you're cancelling..."
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
              Go Back
            </button>
            <button
              onClick={onCancel}
              disabled={processing || !cancelNote}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
