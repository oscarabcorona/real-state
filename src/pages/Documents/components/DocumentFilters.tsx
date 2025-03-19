import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_REQUIREMENTS } from "../const";
import { X } from "lucide-react";

interface FiltersState {
  type: string;
  status: string;
  dateRange: string;
  verified: string;
}

interface DocumentFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  visible: boolean;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  visible,
}) => {
  if (!visible) return null;

  const handleFilterChange = (field: keyof FiltersState, value: string) => {
    // Treat "all" value as empty string for filter logic
    const filterValue = value === "all" ? "" : value;
    onFilterChange({ ...filters, [field]: filterValue });
  };

  const clearFilters = () => {
    onFilterChange({
      type: "",
      status: "",
      dateRange: "",
      verified: "",
    });
  };

  // Function to get display value for select controls
  const getSelectValue = (value: string) => {
    return value === "" ? "all" : value;
  };

  return (
    <Card className="mb-6 p-6 border-dashed">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Status
          </label>
          <Select
            value={getSelectValue(filters.status)}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Type
          </label>
          <Select
            value={getSelectValue(filters.type)}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOCUMENT_REQUIREMENTS.map((req) => (
                <SelectItem key={req.type} value={req.type}>
                  {req.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Date Range
          </label>
          <Select
            value={getSelectValue(filters.dateRange)}
            onValueChange={(value) => handleFilterChange("dateRange", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Verification
          </label>
          <Select
            value={getSelectValue(filters.verified)}
            onValueChange={(value) => handleFilterChange("verified", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {Object.values(filters).some((v) => v) && (
        <div className="mt-6 flex justify-end border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear all filters
          </Button>
        </div>
      )}
    </Card>
  );
};
