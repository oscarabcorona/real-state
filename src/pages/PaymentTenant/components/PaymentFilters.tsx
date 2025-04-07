import { Button } from "@/components/ui/button";
import { FilterDialog } from "./FilterDialog";
import { PaymentFilters as PaymentFiltersType } from "../types";
import { useTranslation } from "react-i18next";

type PaymentFiltersProps = {
  filters: PaymentFiltersType;
  onFilterChange: (filters: PaymentFiltersType) => void;
};

export function PaymentFilters({
  filters,
  onFilterChange,
}: PaymentFiltersProps) {
  const { t } = useTranslation();

  const clearFilters = () => {
    onFilterChange({
      status: "all",
      paymentMethod: "all",
      dateRange: "all",
      minAmount: "",
      maxAmount: "",
    });
  };

  const filtersApplied = Object.entries(filters).some(([key, value]) => {
    // Consider a filter applied if it's not an empty string (for amount fields)
    // and not "all" (for select fields)
    if (key === "minAmount" || key === "maxAmount") {
      return value !== "";
    }
    return value !== "all";
  });

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-2">
        {filtersApplied && (
          <Button variant="ghost" onClick={clearFilters}>
            {t("paymentTenant.filters.clearAll")}
          </Button>
        )}
        <FilterDialog
          onApplyFilters={onFilterChange}
          currentFilters={filters}
        />
      </div>
    </div>
  );
}
