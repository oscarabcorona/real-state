import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { AppointmentStatus } from "../../Calendar/types";
import { Filter, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface AppointmentFilters {
  status: AppointmentStatus | "all";
  dateRange: "all" | "7days" | "30days" | "90days";
  propertyName: string;
}

interface FilterDialogProps {
  onApplyFilters: (filters: AppointmentFilters) => void;
  currentFilters: AppointmentFilters;
}

export function FilterDialog({
  onApplyFilters,
  currentFilters,
}: FilterDialogProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AppointmentFilters>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      propertyName: "",
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <h4 className="font-medium">{t("common.filter")}</h4>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{t("common.filter")}</h4>
          {currentFilters.status !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleReset}
            >
              <X className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("appointmentTenant.filters.status.title")}</Label>
            <RadioGroup
              value={filters.status}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value as AppointmentStatus | "all",
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all">
                  {t("appointmentTenant.filters.status.all")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="status-pending" />
                <Label htmlFor="status-pending">
                  {t("appointmentTenant.filters.status.pending")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confirmed" id="status-confirmed" />
                <Label htmlFor="status-confirmed">
                  {t("appointmentTenant.filters.status.confirmed")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cancelled" id="status-cancelled" />
                <Label htmlFor="status-cancelled">
                  {t("appointmentTenant.filters.status.cancelled")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t("appointmentTenant.filters.dateRange.title")}</Label>
            <RadioGroup
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  dateRange: value as "all" | "7days" | "30days" | "90days",
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="date-all" />
                <Label htmlFor="date-all">
                  {t("appointmentTenant.filters.dateRange.all")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7days" id="date-7days" />
                <Label htmlFor="date-7days">
                  {t("appointmentTenant.filters.dateRange.last7Days")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30days" id="date-30days" />
                <Label htmlFor="date-30days">
                  {t("appointmentTenant.filters.dateRange.last30Days")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="90days" id="date-90days" />
                <Label htmlFor="date-90days">
                  {t("appointmentTenant.filters.dateRange.last90Days")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t("appointmentTenant.filters.propertyName.title")}</Label>
            <Input
              placeholder={t(
                "appointmentTenant.filters.propertyName.placeholder"
              )}
              value={filters.propertyName}
              onChange={(e) =>
                setFilters({ ...filters, propertyName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleApply}>{t("common.apply")}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
