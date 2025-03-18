import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

type FiltersState = {
  status: string;
  paymentMethod: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
};

type PaymentFiltersProps = {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
};

export function PaymentFilters({
  filters,
  onFilterChange,
}: PaymentFiltersProps) {
  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "",
      paymentMethod: "",
      dateRange: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const filtersApplied = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Payments</h1>
        <div className="flex gap-2">
          {filtersApplied && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          <Accordion type="single" collapsible className="w-full max-w-sm">
            <AccordionItem value="filters" className="border-none">
              <AccordionTrigger className="w-full rounded-md border px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                <div className="flex w-full items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {filtersApplied && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {Object.values(filters).filter((v) => v).length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Payment Method
                    </label>
                    <Select
                      value={filters.paymentMethod}
                      onValueChange={(value) =>
                        handleFilterChange("paymentMethod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="ach">ACH</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) =>
                        handleFilterChange("dateRange", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Amount Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={filters.minAmount}
                          onChange={(e) =>
                            handleFilterChange("minAmount", e.target.value)
                          }
                          className="pl-6"
                          placeholder="Min"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={filters.maxAmount}
                          onChange={(e) =>
                            handleFilterChange("maxAmount", e.target.value)
                          }
                          className="pl-6"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
