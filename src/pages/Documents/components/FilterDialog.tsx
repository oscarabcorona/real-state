import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import type { DocumentFilters } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterDialogProps {
  onApplyFilters: (filters: DocumentFilters) => void;
  currentFilters: DocumentFilters;
}

export function FilterDialog({
  onApplyFilters,
  currentFilters,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<DocumentFilters>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    const resetFilters = {
      type: "all",
      status: "all",
      dateRange: "all",
      verified: "all",
      country: currentFilters.country,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    setIsOpen(false);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "all"
  ).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">Filters</h4>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleReset}
            >
              <X className="mr-2 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <RadioGroup
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="type-all" />
                  <Label htmlFor="type-all">All Types</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_report" id="type-credit" />
                  <Label htmlFor="type-credit">Credit Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="criminal_report" id="type-criminal" />
                  <Label htmlFor="type-criminal">Criminal Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eviction_report" id="type-eviction" />
                  <Label htmlFor="type-eviction">Eviction Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="income_verification"
                    id="type-income"
                  />
                  <Label htmlFor="type-income">Income Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="id_document" id="type-id" />
                  <Label htmlFor="type-id">ID Document</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lease" id="type-lease" />
                  <Label htmlFor="type-lease">Lease</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="type-other" />
                  <Label htmlFor="type-other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all">All Statuses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="status-pending" />
                  <Label htmlFor="status-pending">Pending</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verified" id="status-verified" />
                  <Label htmlFor="status-verified">Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="status-rejected" />
                  <Label htmlFor="status-rejected">Rejected</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Date Range</Label>
              <RadioGroup
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateRange: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">All Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7days" id="date-7days" />
                  <Label htmlFor="date-7days">Last 7 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30days" id="date-30days" />
                  <Label htmlFor="date-30days">Last 30 Days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90days" id="date-90days" />
                  <Label htmlFor="date-90days">Last 90 Days</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Verification Status</Label>
              <RadioGroup
                value={filters.verified}
                onValueChange={(value) =>
                  setFilters({ ...filters, verified: value })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="verified-all" />
                  <Label htmlFor="verified-all">All Documents</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verified" id="verified-yes" />
                  <Label htmlFor="verified-yes">Verified Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unverified" id="verified-no" />
                  <Label htmlFor="verified-no">Unverified Only</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Button className="w-full" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
