import React from "react";
import { Payment, PaymentFilters } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "../table/data-table";
import { columns } from "../table/columns";
import { useTranslation } from "react-i18next";

interface TransactionsTabProps {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filters: PaymentFilters;
  setFilters: React.Dispatch<React.SetStateAction<PaymentFilters>>;
  resetFilters: () => void;
  exportPayments: () => void;
  filteredPayments: Payment[];
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  filters,
  setFilters,
  resetFilters,
  exportPayments,
  filteredPayments,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("payments.transactions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredPayments}
            isLoading={false}
            onExport={exportPayments}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
};
