import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Document } from "../types";
import { DOCUMENT_REQUIREMENTS } from "../const";
import { FileUploadInput } from "../FileUploadInput";

interface UploadModalProps {
  uploadForm: {
    title: string;
    type: Document["type"];
    file: File | null;
    property_id: string;
  };
  onFormChange: (form: Partial<UploadModalProps["uploadForm"]>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadSuccess: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  uploadForm,
  onFormChange,
  onSubmit,
  onClose,
  uploading,
  uploadProgress,
  uploadError,
  uploadSuccess,
  handleFileChange,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Document</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              value={uploadForm.type}
              onChange={(e) =>
                onFormChange({
                  ...uploadForm,
                  type: e.target.value as Document["type"],
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              {DOCUMENT_REQUIREMENTS.map((req) => (
                <option key={req.type} value={req.type}>
                  {req.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) =>
                onFormChange({ ...uploadForm, title: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Document title"
            />
          </div>

          <FileUploadInput
            onChange={handleFileChange}
            disabled={uploading}
            selectedFile={uploadForm.file}
          />

          {uploadError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {uploadError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Document uploaded successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {(uploading || uploadProgress > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !uploadForm.file || uploadSuccess}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Uploaded
              </>
            ) : (
              "Upload Document"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
