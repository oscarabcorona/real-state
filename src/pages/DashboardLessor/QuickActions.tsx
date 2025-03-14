import { Bell, Building2, CreditCard, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <Link
          to="/dashboard/properties/new"
          className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <Building2 className="h-6 w-6 text-indigo-600 mr-3" />
          Add Property
        </Link>
        <Link
          to="/dashboard/payments"
          className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
          View Payments
        </Link>
        <Link
          to="/dashboard/documents"
          className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <FileText className="h-6 w-6 text-indigo-600 mr-3" />
          Documents
        </Link>
        <Link
          to="/dashboard/notifications"
          className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <Bell className="h-6 w-6 text-indigo-600 mr-3" />
          Notifications
        </Link>
      </div>
    </div>
  );
}
