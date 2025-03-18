import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePaymentData,
  usePaymentExport,
  usePaymentForm,
  usePaymentModals,
} from "@/hooks/usePayment";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PaymentModal } from "./components/PaymentModal";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { SettingsTab } from "./components/tabs/SettingsTab";
import { TransactionsTab } from "./components/tabs/TransactionsTab";
import { getStatusIcon } from "./utils";

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
    <div className="space-y-6 container mx-auto py-6">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Payments</h1>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <div className="px-6">
              <TabsList className="h-10 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Payment Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <CardContent className="p-6">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab
                stats={stats}
                filteredPayments={filteredPayments}
                getStatusIcon={getStatusIcon}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <TransactionsTab
                isFilterModalOpen={isFilterModalOpen}
                setIsFilterModalOpen={setIsFilterModalOpen}
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                exportPayments={handleExportPayments}
                filteredPayments={filteredPayments}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Payment Modal */}
      {isModalOpen && (
        <PaymentModal
          formData={formData}
          setFormData={setFormData}
          properties={properties}
          handleSubmit={async (e) => {
            const success = await handleSubmit(e);
            if (success) setIsModalOpen(false);
            return success;
          }}
          setIsModalOpen={setIsModalOpen}
          loading={loading}
        />
      )}
    </div>
  );
}
