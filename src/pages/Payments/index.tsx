import { Plus } from "lucide-react";
import React, { useState } from "react";
import { PaymentModal } from "./components/PaymentModal";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { SettingsTab } from "./components/tabs/SettingsTab";
import { TransactionsTab } from "./components/tabs/TransactionsTab";
import { getStatusIcon } from "./utils";
import {
  usePaymentData,
  usePaymentModals,
  usePaymentForm,
  usePaymentExport,
} from "@/hooks/usePayment";

export function Payments() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    filteredPayments,
    properties,
    stats,
    filters,
    setFilters,
    resetFilters,
  } = usePaymentData();

  const {
    isModalOpen,
    isFilterModalOpen,
    setIsModalOpen,
    setIsFilterModalOpen,
  } = usePaymentModals();

  const { formData, setFormData, handleSubmit, loading } = usePaymentForm();
  const { handleExportPayments } = usePaymentExport();

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
          handleSubmit={async (e) => {
            const success = await handleSubmit(e);
            if (success) setIsModalOpen(false);
          }}
          setIsModalOpen={setIsModalOpen}
          loading={loading}
        />
      )}
    </div>
  );
}
