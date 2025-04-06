import { Button } from "@/components/ui/button";
import { FilterDialog } from "./FilterDialog";
import { PaymentFilters as PaymentFiltersType } from "../types";

type PaymentFiltersProps = {
  filters: PaymentFiltersType;
  onFilterChange: (filters: PaymentFiltersType) => void;
};

export function PaymentFilters({
  filters,
  onFilterChange,
}: PaymentFiltersProps) {
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
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payments</h2>
        <div className="flex items-center gap-2">
          {filtersApplied && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          <FilterDialog
            onApplyFilters={onFilterChange}
            currentFilters={filters}
          />
        </div>
      </div>
    </div>
  );
}
