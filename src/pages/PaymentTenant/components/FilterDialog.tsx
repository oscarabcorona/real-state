import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { PaymentFilters } from "../types";
import { useTranslation } from "react-i18next";

interface FilterDialogProps {
  onApplyFilters: (filters: PaymentFilters) => void;
  currentFilters: PaymentFilters;
}

export function FilterDialog({
  onApplyFilters,
  currentFilters,
}: FilterDialogProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PaymentFilters>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    const resetFilters = {
      status: "all",
      paymentMethod: "all",
      dateRange: "all",
      minAmount: "",
      maxAmount: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    setIsOpen(false);
  };

  const handleApply = () => {
    // Convert empty values to "all" for consistency
    const processedFilters = {
      ...filters,
      status: filters.status || "all",
      paymentMethod: filters.paymentMethod || "all",
      dateRange: filters.dateRange || "all",
    };
    onApplyFilters(processedFilters);
    setIsOpen(false);
  };

  // When initializing filters, make sure to show UI values correctly
  useEffect(() => {
    // Convert any empty strings to "all" for display in UI
    setFilters({
      ...currentFilters,
      status: currentFilters.status || "all",
      paymentMethod: currentFilters.paymentMethod || "all",
      dateRange: currentFilters.dateRange || "all",
    });
  }, [currentFilters]);

  // Count active filters (non-empty values)
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "" && v !== "all"
  ).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t("paymentTenant.filters.title")}
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">{t("paymentTenant.filters.title")}</h4>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleReset}
            >
              <X className="mr-2 h-3 w-3" />
              {t("paymentTenant.filters.reset")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[425px]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>{t("paymentTenant.filters.status")}</Label>
              <RadioGroup
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all">
                    {t("paymentTenant.filters.status_options.all")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="status-pending" />
                  <Label htmlFor="status-pending">
                    {t("paymentTenant.filters.status_options.pending")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="status-completed" />
                  <Label htmlFor="status-completed">
                    {t("paymentTenant.filters.status_options.paid")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="failed" id="status-failed" />
                  <Label htmlFor="status-failed">
                    {t("paymentTenant.filters.status_options.failed")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("paymentTenant.filters.method")}</Label>
              <RadioGroup
                value={filters.paymentMethod || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, paymentMethod: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="method-all" />
                  <Label htmlFor="method-all">
                    {t("paymentTenant.filters.method_options.all")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="method-credit" />
                  <Label htmlFor="method-credit">
                    {t("paymentTenant.filters.method_options.creditCard")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ach" id="method-ach" />
                  <Label htmlFor="method-ach">
                    {t("paymentTenant.filters.method_options.bankTransfer")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="method-cash" />
                  <Label htmlFor="method-cash">
                    {t("paymentTenant.filters.method_options.cash")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("paymentTenant.filters.dateRange")}</Label>
              <RadioGroup
                value={filters.dateRange || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateRange: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">
                    {t("paymentTenant.filters.date_options.all")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7days" id="date-7days" />
                  <Label htmlFor="date-7days">
                    {t("paymentTenant.filters.date_options.7days")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30days" id="date-30days" />
                  <Label htmlFor="date-30days">
                    {t("paymentTenant.filters.date_options.30days")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90days" id="date-90days" />
                  <Label htmlFor="date-90days">
                    {t("paymentTenant.filters.date_options.90days")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("paymentTenant.filters.amountRange")}</Label>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="min-amount" className="text-xs">
                    {t("paymentTenant.filters.minAmount")}
                  </Label>
                  <Input
                    id="min-amount"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                    placeholder={t("paymentTenant.filters.minAmount")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-amount" className="text-xs">
                    {t("paymentTenant.filters.maxAmount")}
                  </Label>
                  <Input
                    id="max-amount"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                    placeholder={t("paymentTenant.filters.maxAmount")}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Button className="w-full" onClick={handleApply}>
            {t("paymentTenant.filters.apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
