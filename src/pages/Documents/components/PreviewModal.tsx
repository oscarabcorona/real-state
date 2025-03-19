import React from "react";
import { AlertCircle, CheckCircle, Download, Trash2, X } from "lucide-react";
import { Document } from "../types";
import { getStatusClass, getStatusText } from "../utils";

interface PreviewModalProps {
  document: Document;
  verificationNote: string;
  rejectionReason: string;
  onVerificationNoteChange: (note: string) => void;
  onVerify: (document: Document) => void;
  onReject: (document: Document) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onDelete: (id: string, filePath: string) => void;
  onClose: () => void;
  processingDocument: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  document,
  verificationNote,
  onVerificationNoteChange,
  onVerify,
  onReject,
  onDownload,
  onDelete,
  onClose,
  processingDocument,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Document Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="text-sm text-gray-900">{document.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900">
                  {document.type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      document.status,
                      document.verified
                    )}`}
                  >
                    {getStatusText(document.status, document.verified)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(document.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Property</dt>
                <dd className="text-sm text-gray-900">
                  {document.property?.name}
                </dd>
              </div>
              {document.verification_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Verified On
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(document.verification_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {document.rejection_reason && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Rejection Reason
                  </dt>
                  <dd className="text-sm text-red-600">
                    {document.rejection_reason}
                  </dd>
                </div>
              )}
              {document.notes && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="text-sm text-gray-900">{document.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {document.status === "pending" && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => onVerificationNoteChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add any notes about the verification..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => onVerify(document)}
                  disabled={processingDocument}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </button>
                <button
                  onClick={() => onReject(document)}
                  disabled={processingDocument}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() =>
                onDownload(
                  document.file_path,
                  `${document.title || document.type}.pdf`
                )
              }
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={() => onDelete(document.id, document.file_path)}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
