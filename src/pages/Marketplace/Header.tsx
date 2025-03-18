import { Building2, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
}: {
  filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  };
  setFilters: (filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  }) => void;
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
}) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Property Listings</h1>
        </div>
        <Separator orientation="vertical" className="h-6 mx-4" />
        <div className="flex items-center gap-2 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showFilters ? "Hide filters" : "Show filters"}
            </TooltipContent>
          </Tooltip>

          {activeFiltersCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      type: "",
                      minPrice: "",
                      maxPrice: "",
                      bedrooms: "",
                      city: "",
                      state: "",
                    })
                  }
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset all filters</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  );
}
