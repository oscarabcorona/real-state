import React from "react";
import { PaymentFilters } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

interface FilterPanelProps {
  filters: PaymentFilters;
  setFilters: React.Dispatch<React.SetStateAction<PaymentFilters>>;
  resetFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  resetFilters,
}) => (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger id="status">
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
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select
            value={filters.paymentMethod || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                paymentMethod: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger id="payment-method">
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
          <Label htmlFor="date-range">Date Range</Label>
          <Select
            value={filters.dateRange || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger id="date-range">
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
          <Label htmlFor="min-amount">Min Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="min-amount"
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
              }
              placeholder="0.00"
              className="pl-6"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="max-amount">Max Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="max-amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
              }
              placeholder="0.00"
              className="pl-6"
            />
          </div>
        </div>
      </div>

      {Object.values(filters).some((value) => value !== "") && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={resetFilters} className="h-8">
            <XIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
