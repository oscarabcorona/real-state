import { Building2, Filter, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
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
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Property Listings</h1>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex relative flex-1 max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location or property name..."
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

        <div className="flex items-center gap-3 ml-auto">
          {/* Desktop Filter Toggle - fixed appearance */}
          <Toggle
            pressed={showFilters}
            onPressedChange={setShowFilters}
            variant={showFilters ? "default" : "outline"}
            className={`hidden md:flex gap-2 transition-all duration-200 ${
              showFilters
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : ""
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant={showFilters ? "secondary" : "default"}
                className={`ml-1 ${
                  showFilters ? "bg-primary-foreground text-primary" : ""
                }`}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Toggle>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 -mt-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-md p-0">
              <div className="p-4 border-b sticky top-0 bg-background z-10">
                <h2 className="font-semibold text-lg mb-4">
                  Filter Properties
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location..."
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
              </div>
              <ScrollArea className="h-[calc(100vh-9rem)]">
                <div className="p-4">
                  <Filters
                    filters={filters}
                    setFilters={setFilters}
                    showFilters={true}
                  />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
