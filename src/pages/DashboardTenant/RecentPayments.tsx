import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { Payment } from "./types";
import { getStatusClass, getStatusIcon } from "./utils";

export function RecentPayments({ payments }: { payments: Payment[] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
          <Link
            to="/dashboard/payments"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payment history available
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(payment.status)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.properties?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    ${payment.amount.toLocaleString()}
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
