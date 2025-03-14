import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileBarChart,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        to="/dashboard/marketplace"
        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      >
        <Search className="h-8 w-8 text-indigo-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Find Properties
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Browse available properties
        </p>
        <div className="mt-4 flex items-center text-indigo-600">
          <span className="text-sm font-medium">Browse Now</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>

      <Link
        to="/dashboard/documents"
        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      >
        <FileBarChart className="h-8 w-8 text-indigo-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Upload Documents
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Submit required documentation
        </p>
        <div className="mt-4 flex items-center text-indigo-600">
          <span className="text-sm font-medium">Upload Now</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>

      <Link
        to="/dashboard/payments"
        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      >
        <CreditCard className="h-8 w-8 text-indigo-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Make Payment</h3>
        <p className="mt-1 text-sm text-gray-500">
          Pay rent or schedule auto-pay
        </p>
        <div className="mt-4 flex items-center text-indigo-600">
          <span className="text-sm font-medium">Pay Now</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>

      <Link
        to="/dashboard/appointments"
        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      >
        <Calendar className="h-8 w-8 text-indigo-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Schedule Viewing
        </h3>
        <p className="mt-1 text-sm text-gray-500">Book property viewings</p>
        <div className="mt-4 flex items-center text-indigo-600">
          <span className="text-sm font-medium">Schedule Now</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
