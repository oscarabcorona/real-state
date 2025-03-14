import {
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Payment, PaymentDetails } from "./types";

export function PaymentTenant() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
  });
  const [stats, setStats] = useState({
    totalPaid: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const fetchPayments = async () => {
    try {
      const { data: accessData, error: accessError } = await supabase
        .from("tenant_property_access")
        .select("property_id")
        .eq("tenant_user_id", user?.id);

      if (accessError) throw accessError;

      const propertyIds = accessData?.map((a) => a.property_id) || [];

      if (propertyIds.length === 0) {
        setPayments([]);
        setStats({ totalPaid: 0, pending: 0, failed: 0 });
        setLoading(false);
        return;
      }

      let query = supabase
        .from("payments")
        .select(
          `
            *,
            properties:property_id (
              name,
              user:user_id (
                email
              )
            )
          `
        )
        .in("property_id", propertyIds);

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }
      if (filters.dateRange) {
        const now = new Date();
        const startDate = new Date();

        switch (filters.dateRange) {
          case "7days":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(now.getDate() - 30);
            break;
          case "90days":
            startDate.setDate(now.getDate() - 90);
            break;
        }

        query = query.gte("created_at", startDate.toISOString());
      }
      if (filters.minAmount) {
        query = query.gte("amount", parseFloat(filters.minAmount));
      }
      if (filters.maxAmount) {
        query = query.lte("amount", parseFloat(filters.maxAmount));
      }

      const { data: paymentsData, error: paymentsError } = await query.order(
        "created_at",
        { ascending: false }
      );

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);

      const total =
        paymentsData?.reduce(
          (sum, payment) =>
            payment.status === "completed" ? sum + payment.amount : sum,
          0
        ) || 0;
      const pending =
        paymentsData?.reduce(
          (sum, payment) =>
            payment.status === "pending" ? sum + payment.amount : sum,
          0
        ) || 0;
      const failed =
        paymentsData?.reduce(
          (sum, payment) =>
            payment.status === "failed" ? sum + payment.amount : sum,
          0
        ) || 0;

      setStats({
        totalPaid: total,
        pending: pending,
        failed: failed,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const processPayment = async (
    paymentMethod: "credit_card" | "ach" | "cash"
  ) => {
    if (!selectedPayment) return;

    try {
      const paymentDetails: PaymentDetails = {
        method: paymentMethod,
        timestamp: new Date().toISOString(),
        info:
          paymentMethod === "credit_card"
            ? {
                last4: "4242",
                brand: "visa",
                exp_month: 12,
                exp_year: 2025,
              }
            : paymentMethod === "ach"
            ? {
                bank_name: "Test Bank",
                account_last4: "1234",
                routing_last4: "5678",
              }
            : {
                received_by: "Office",
                location: "Main Office",
              },
      };

      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          verified_at: new Date().toISOString(),
          verification_method: "automatic",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPayment.id);

      if (updateError) throw updateError;

      // Wait for document generation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowPaymentModal(false);
      setSelectedPayment(null);
      await fetchPayments();

      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const downloadInvoice = async (payment: Payment) => {
    if (!payment.invoice_file_path) {
      alert("Invoice not available");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("invoices")
        .download(payment.invoice_file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${payment.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

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

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Process Payment</h3>
          <button
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Amount:</span> $
              {selectedPayment?.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Property:</span>{" "}
              {selectedPayment?.properties.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Invoice:</span>{" "}
              {selectedPayment?.invoice_number}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => processPayment("credit_card")}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay with Credit Card
            </button>

            <button
              onClick={() => processPayment("ach")}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Pay with ACH Transfer
            </button>

            <button
              onClick={() => processPayment("cash")}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pay with Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.values(filters).some((v) => v) && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {Object.values(filters).filter((v) => v).length}
                </span>
              )}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  showFilters ? "transform rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Paid
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.totalPaid.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.pending.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Failed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.failed.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentMethod: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Methods</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="ach">ACH</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) =>
                        setFilters({ ...filters, minAmount: e.target.value })
                      }
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) =>
                        setFilters({ ...filters, maxAmount: e.target.value })
                      }
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {Object.values(filters).some((v) => v) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      setFilters({
                        status: "",
                        paymentMethod: "",
                        dateRange: "",
                        minAmount: "",
                        maxAmount: "",
                      })
                    }
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No payments found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No payment records match your current filters.
              </p>
            </div>
          ) : (
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
                          <span className="ml-1 capitalize">
                            {payment.status}
                          </span>
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
                              onClick={() => handlePayment(payment)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </button>
                          )}
                          {payment.invoice_file_path && (
                            <button
                              onClick={() => downloadInvoice(payment)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </button>
                          )}
                          {payment.receipt_file_path &&
                            payment.status === "completed" && (
                              <button
                                onClick={() => downloadInvoice(payment)}
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
          )}
        </div>
      </div>

      {showPaymentModal && selectedPayment && <PaymentModal />}
    </div>
  );
}
