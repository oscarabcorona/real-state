import { Building2, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filters } from "./Filters";
import React from "react";

interface HeaderProps {
  filters: {
    type: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    city: string;
    state: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      type: string;
      minPrice: string;
      maxPrice: string;
      bedrooms: string;
      city: string;
      state: string;
    }>
  >;
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
}

export function Header({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
}: HeaderProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-8">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Property Listings</h1>
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city, state or zip code..."
              className="pl-9"
              value={filters.city}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  city: e.target.value,
                }));
              }}
            />
          </div>
          <Button
            variant="outline"
            className="flex gap-2 min-w-[100px]"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">Filters</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Filters
              filters={filters}
              setFilters={setFilters}
              showFilters={true}
            />
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({
                  type: "",
                  minPrice: "",
                  maxPrice: "",
                  bedrooms: "",
                  city: "",
                  state: "",
                });
              }}
            >
              Clear all
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Show{" "}
              {activeFiltersCount > 0
                ? `${activeFiltersCount} properties`
                : "properties"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
