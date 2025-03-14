import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { Document } from "./types";
import { getStatusClass } from "./utils";

export function RecentDocuments({ documents }: { documents: Document[] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Documents
          </h2>
          <Link
            to="/dashboard/documents"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {documents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No documents available
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {doc.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.properties?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    {format(new Date(doc.created_at), "MMM d, yyyy")}
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
