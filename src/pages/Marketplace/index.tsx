import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewingModal } from "@/components/ViewingModal";
import { Building2, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Filters } from "./Filters";
import { Header } from "./Header";
import type { Property } from "./types";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "./components/PropertyCard";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { useProperties, SortOption } from "./hooks/useProperties";
import { usePagination } from "./hooks/usePagination";
import { useFavorites } from "./hooks/useFavorites";
import { useFilters } from "./hooks/useFilters";

export function Marketplace() {
  const { user } = useAuthStore();
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Use custom hooks - add setFilters to the destructuring
  const {
    filters,
    setFilters, // Add this line
    showFilters,
    handleToggleFilters,
    countActiveFilters,
    clearAllFilters,
    handleFilterChange,
  } = useFilters();

  const { properties, loading } = useProperties(filters, sortOption);
  const { favorites, toggleFavorite } = useFavorites();
  const {
    currentItems,
    currentPage,
    totalPages,
    handlePageChange,
    getPageNumbers,
  } = usePagination(properties, 9); // 9 items per page (3x3 grid)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={handleToggleFilters}
      />

      <div className="container py-6">
        {/* Mobile search and sorting - only visible on mobile */}
        <div className="md:hidden mb-6">
          <Select
            value={sortOption}
            onValueChange={(value: SortOption) => setSortOption(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <div
            className={`hidden md:block sticky top-[5rem] self-start transition-all duration-300 ease-in-out overflow-hidden ${
              showFilters ? "w-72 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div
              className={`bg-background rounded-lg border shadow-sm p-4 h-[calc(100vh-5rem)] ${
                showFilters ? "transform-none" : "transform -translate-x-full"
              } transition-transform duration-300 ease-in-out`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Filter Properties</h2>
                {countActiveFilters() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <Filters
                  filters={filters}
                  setFilters={setFilters}
                  showFilters={true}
                />
              </ScrollArea>
            </div>
          </div>

          <main
            className={`flex-1 transition-all duration-300 ease-in-out ${
              showFilters ? "" : "lg:px-8"
            }`}
          >
            {/* Desktop Sort and Results Count */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {loading
                  ? "Loading properties..."
                  : `${properties.length} ${
                      properties.length === 1 ? "Property" : "Properties"
                    } Available`}
                {countActiveFilters() > 0 &&
                  ` with ${countActiveFilters()} ${
                    countActiveFilters() === 1 ? "filter" : "filters"
                  }`}
              </p>
              <Select
                value={sortOption}
                onValueChange={(value: SortOption) => setSortOption(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high-low">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters display */}
            {countActiveFilters() > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters).map(
                  ([key, value]) =>
                    value && (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="px-2 py-1 gap-1 text-sm"
                      >
                        {key === "minPrice"
                          ? `$${value}+`
                          : key === "maxPrice"
                          ? `Up to $${value}`
                          : key === "bedrooms"
                          ? `${value}+ beds`
                          : value}
                        <button
                          onClick={() =>
                            handleFilterChange(key as keyof typeof filters, "")
                          }
                          className="hover:text-destructive ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-7"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/70" />
                <h3 className="mt-4 font-medium text-lg">
                  No properties found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favorites.includes(property.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={(property) => {
                        setSelectedProperty(property);
                        setShowDetailsModal(true);
                      }}
                      onSchedule={(property) => {
                        setSelectedProperty(property);
                        setShowAppointmentModal(true);
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {getPageNumbers().map((pageNumber, idx) => (
                          <PaginationItem key={idx}>
                            {pageNumber === "ellipsis" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() =>
                                  handlePageChange(pageNumber as number)
                                }
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {selectedProperty && (
        <>
          <ViewingModal
            open={showAppointmentModal}
            onOpenChange={setShowAppointmentModal}
            propertyId={selectedProperty.id}
            userId={user?.id}
            userEmail={user?.email}
            userName={user?.full_name || user?.email}
            onSuccess={() => {
              setSelectedProperty(null);
            }}
          />

          <PropertyDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            property={selectedProperty}
            onScheduleViewing={() => {
              setShowDetailsModal(false);
              setShowAppointmentModal(true);
            }}
            isFavorite={favorites.includes(selectedProperty.id)}
            onToggleFavorite={() => toggleFavorite(selectedProperty.id)}
          />
        </>
      )}
    </div>
  );
}

export default Marketplace;
