import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import { Payment } from "../types";

type PaymentsTableProps = {
  payments: Payment[];
  loading: boolean;
  onPaymentClick: (payment: Payment) => void;
  onDownloadInvoice: (payment: Payment) => void;
};

export function PaymentsTable({
  payments,
  loading,
  onPaymentClick,
  onDownloadInvoice,
}: PaymentsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No payments found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No payment records match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Invoice #
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Property
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Method
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Created By
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="font-medium text-gray-900">
                  {payment.invoice_number}
                </div>
              </td>
              <td className="px-3 py-4 text-sm">
                <div className="font-medium text-gray-900">
                  {payment.properties.name}
                </div>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <div className="font-medium">
                  ${payment.amount.toLocaleString()}
                </div>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <div className="capitalize">
                  {payment.payment_method.replace("_", " ")}
                </div>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    payment.status
                  )}`}
                >
                  {getStatusIcon(payment.status)}
                  <span className="ml-1 capitalize">{payment.status}</span>
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {payment.properties.user?.email}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {new Date(payment.created_at).toLocaleDateString()}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  {payment.status === "pending" && (
                    <button
                      onClick={() => onPaymentClick(payment)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Pay Now
                    </button>
                  )}
                  {payment.invoice_file_path && (
                    <button
                      onClick={() => onDownloadInvoice(payment)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Invoice
                    </button>
                  )}
                  {payment.receipt_file_path &&
                    payment.status === "completed" && (
                      <button
                        onClick={() => onDownloadInvoice(payment)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
