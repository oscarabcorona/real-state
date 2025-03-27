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
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

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
  }, [user, filters, currentPage, pageSize]);

  useEffect(() => {
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
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My Payments</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your property payments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <PaymentStats
        totalPaid={stats.totalPaid}
        pending={stats.pending}
        failed={stats.failed}
      />

      <div className="rounded-xl border bg-background">
        {showFilters && (
          <div className="border-b p-6 animate-in slide-in-from-top-2 duration-200">
            <PaymentFilters filters={filters} onFilterChange={setFilters} />
          </div>
        )}

        <div className="p-6">
          {payments.length > 0 ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl text-muted-foreground">$</div>
              <h3 className="mt-4 text-lg font-medium">No payments found</h3>
              <p className="text-sm text-muted-foreground">
                No payment records match your current filters.
              </p>
            </div>
          )}
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
