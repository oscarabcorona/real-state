import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Payment } from "./types";
import { PaymentStats } from "./components/PaymentStats";
import { PaymentFilters } from "./components/PaymentFilters";
import { PaymentsTable } from "./components/PaymentsTable";
import { PaymentModal } from "./components/PaymentModal";
import {
  fetchTenantPayments,
  processPayment,
  downloadInvoice,
} from "../../services/tenantPaymentService";
import { useOptimistic } from "../../hooks/useOptimisticAction";

export function PaymentTenant() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useOptimistic<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
  });
  const [stats, setStats] = useOptimistic({
    totalPaid: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPaymentsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        return;
      }

      const result = await fetchTenantPayments(user.id, filters);

      setPayments(result.payments);
      setStats(result.stats);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (
    paymentMethod: "credit_card" | "ach" | "cash"
  ) => {
    if (!selectedPayment) return;

    try {
      await processPayment(selectedPayment.id, paymentMethod);

      setShowPaymentModal(false);
      setSelectedPayment(null);
      await fetchPaymentsData();

      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      const data = await downloadInvoice(payment);

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <PaymentFilters filters={filters} onFilterChange={setFilters} />
        </div>

        <div className="p-6">
          <PaymentStats
            totalPaid={stats.totalPaid}
            pending={stats.pending}
            failed={stats.failed}
          />

          <PaymentsTable
            payments={payments}
            loading={loading}
            onPaymentClick={handlePayment}
            onDownloadInvoice={handleDownloadInvoice}
          />
        </div>
      </div>

      {showPaymentModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setShowPaymentModal(false)}
          onProcessPayment={handleProcessPayment}
        />
      )}
    </div>
  );
}
