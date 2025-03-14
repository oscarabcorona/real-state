import { format } from "date-fns";
import { FileText, FolderIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Document } from "./types";
import { getStatusClass } from "./utils";

export function RecentDocuments({ documents }: { documents: Document[] }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Documents
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your property documents
            </p>
          </div>
          <Link
            to="/dashboard/documents"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {documents.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No documents
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading a document.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/documents/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Upload Document
              </Link>
            </div>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-200">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-200">
                      {doc.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {doc.properties?.name}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-4">
                  <span
                    className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full whitespace-nowrap ${getStatusClass(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                  <time
                    className="text-xs text-gray-500 whitespace-nowrap"
                    dateTime={doc.created_at}
                  >
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </time>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
