import React from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import type { Document } from "../types";
import { getStatusClass, getStatusIcon, getStatusText } from "../utils";

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onPreview: (document: Document) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onDelete: (id: string, filePath: string) => void;
  onUpload: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onPreview,
  onDownload,
  onDelete,
  onUpload,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading a document.
        </p>
        <div className="mt-6">
          <button
            onClick={onUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center flex-1 min-w-0">
            <FileText className="h-5 w-5 text-gray-400 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doc.title ||
                  doc.type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{doc.property?.name}</span>
                <span className="mx-2">•</span>
                <span>
                  Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.verification_date && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      Verified on{" "}
                      {new Date(doc.verification_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                doc.status,
                doc.verified
              )}`}
            >
              {getStatusIcon(doc.status, doc.verified)}
              <span className="ml-1">
                {getStatusText(doc.status, doc.verified)}
              </span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPreview(doc)}
                className="text-gray-400 hover:text-gray-500"
                title="Preview"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  onDownload(doc.file_path, `${doc.title || doc.type}.pdf`)
                }
                className="text-gray-400 hover:text-gray-500"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(doc.id, doc.file_path)}
                className="text-gray-400 hover:text-gray-500"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
