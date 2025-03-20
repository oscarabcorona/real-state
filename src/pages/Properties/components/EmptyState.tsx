import { Building2, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddProperty: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({
  onAddProperty,
  isFiltered = false,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <Building2 className="h-10 w-10 text-primary" />
      </div>

      <h3 className="text-xl font-semibold tracking-tight mb-2">
        {isFiltered
          ? "No matching properties found"
          : "No properties added yet"}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">
        {isFiltered
          ? "Try adjusting your filters or search terms to find what you're looking for."
          : "Start adding properties to your portfolio. You can include details, pricing, and amenities to attract potential tenants."}
      </p>

      <div className="flex gap-3">
        {isFiltered ? (
          <Button variant="outline" className="gap-2" onClick={onClearFilters}>
            <RefreshCcw className="h-4 w-4" />
            Clear Filters
          </Button>
        ) : null}

        <Button onClick={onAddProperty} className="gap-2">
          <Plus className="h-4 w-4" />
          {isFiltered ? "Add Property" : "Add Your First Property"}
        </Button>
      </div>
    </div>
  );
}
