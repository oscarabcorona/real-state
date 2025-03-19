import React from "react";
import { Clock, CheckCircle, Upload } from "lucide-react";
import { Document } from "../types";
import { DOCUMENT_REQUIREMENTS } from "../const";

interface DocumentRequirementsProps {
  documents: Document[];
  onUpload: (type: Document["type"]) => void;
}

export const DocumentRequirements: React.FC<DocumentRequirementsProps> = ({
  documents,
  onUpload,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Required Documents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOCUMENT_REQUIREMENTS.map((req) => {
          const doc = documents.find((d) => d.type === req.type);
          const isComplete = doc?.verified;
          const isPending = doc?.status === "pending";

          return (
            <div
              key={req.type}
              className={`p-4 rounded-lg border ${
                isComplete
                  ? "bg-green-50 border-green-200"
                  : isPending
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-lg ${
                    isComplete
                      ? "bg-green-100"
                      : isPending
                      ? "bg-yellow-100"
                      : "bg-gray-100"
                  }`}
                >
                  {req.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {req.label}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {req.description}
                  </p>
                  <div className="mt-2">
                    {isComplete ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => onUpload(req.type)}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
