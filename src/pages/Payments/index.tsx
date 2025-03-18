import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  calculatePaymentStats,
  createPayment,
  exportPaymentsToCSV,
  fetchUserPayments,
  fetchUserProperties,
  filterPayments,
} from "../../services/paymentService";
import { useAuthStore } from "../../store/authStore";
import { PaymentModal } from "./components/PaymentModal";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { SettingsTab } from "./components/tabs/SettingsTab";
import { TransactionsTab } from "./components/tabs/TransactionsTab";
import { Payment, PaymentFilters, Property } from "./types";
import { getStatusIcon } from "./utils";

export function Payments() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCollected: 0,
    pending: 0,
    propertiesCount: 0,
    autoPayActive: 0,
  });
  const { user } = useAuthStore();

  const [filters, setFilters] = useState<PaymentFilters>({
    status: "",
    paymentMethod: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
  });

  const [formData, setFormData] = useState({
    property_id: "",
    amount: "",
    payment_method: "credit_card" as "credit_card" | "ach" | "cash",
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (payments.length) {
      const filtered = filterPayments(payments, filters);
      setFilteredPayments(filtered);
    }
  }, [filters, payments]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      const [propsData, paymentsData] = await Promise.all([
        fetchUserProperties(user.id),
        fetchUserPayments(user.id),
      ]);

      setProperties(propsData);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);

      setStats(calculatePaymentStats(paymentsData, propsData.length));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      dateRange: "",
      minAmount: "",
      maxAmount: "",
    });
    setFilteredPayments(payments);
  };

  const handleExportPayments = () => {
    exportPaymentsToCSV(filteredPayments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);

    try {
      await createPayment(user.id, formData);

      setFormData({
        property_id: "",
        amount: "",
        payment_method: "credit_card",
        description: "",
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`${
                activeTab === "transactions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm`}
            >
              Payment Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              filteredPayments={filteredPayments}
              getStatusIcon={getStatusIcon}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab
              isFilterModalOpen={isFilterModalOpen}
              setIsFilterModalOpen={setIsFilterModalOpen}
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              exportPayments={handleExportPayments}
              filteredPayments={filteredPayments}
            />
          )}

          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <PaymentModal
          formData={formData}
          setFormData={setFormData}
          properties={properties}
          handleSubmit={handleSubmit}
          setIsModalOpen={setIsModalOpen}
          loading={loading}
        />
      )}
    </div>
  );
}
