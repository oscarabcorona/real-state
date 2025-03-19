import { useEffect, useState } from "react";
import { useOptimistic } from "../../hooks/useOptimisticAction";
import {
  downloadInvoice,
  fetchTenantPayments,
  processPayment,
} from "../../services/tenantPaymentService";
import { useAuthStore } from "../../store/authStore";
import { PaymentFilters } from "./components/PaymentFilters";
import { PaymentModal } from "./components/PaymentModal";
import { PaymentsTable } from "./components/PaymentsTable";
import { PaymentStats } from "./components/PaymentStats";
import { Payment } from "./types";

export function PaymentTenant() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useOptimistic<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  }, [user, filters, currentPage, pageSize]);

  useEffect(() => {
    // Connect filter button to accordion trigger and toggle showFilters state
    const filterButton = document.getElementById("filter-trigger");
    const accordionTrigger = document.getElementById(
      "filter-accordion-trigger"
    );

    if (filterButton && accordionTrigger) {
      const handleClick = () => {
        (accordionTrigger as HTMLButtonElement).click();
        setShowFilters(!showFilters);
      };

      filterButton.addEventListener("click", handleClick);

      return () => {
        filterButton.removeEventListener("click", handleClick);
      };
    }
  }, [showFilters]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [filters]);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        return;
      }

      const result = await fetchTenantPayments(
        user.id,
        filters,
        currentPage,
        pageSize
      );

      setPayments(result.payments);
      setStats(result.stats);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <PaymentFilters filters={filters} onFilterChange={setFilters} />
        </div>

        <div
          className={`p-6 pt-0 transition-all duration-300 ease-in-out ${
            showFilters ? "mt-2" : "mt-0"
          }`}
        >
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      <PaymentModal
        payment={selectedPayment!}
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
}
