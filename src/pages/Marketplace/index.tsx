import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewingModal } from "@/components/ViewingModal";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
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

  const {
    filters,
    setFilters,
    showFilters,
    handleToggleFilters,
    clearAllFilters,
  } = useFilters();

  const { properties, loading } = useProperties(filters, sortOption);
  const { favorites, toggleFavorite } = useFavorites();
  const {
    currentItems,
    currentPage,
    totalPages,
    handlePageChange,
    getPageNumbers,
  } = usePagination(properties, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={handleToggleFilters}
      />

      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {loading
              ? "Loading properties..."
              : `${properties.length} ${
                  properties.length === 1 ? "Property" : "Properties"
                } Available`}
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
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/70" />
            <h3 className="mt-4 font-medium text-lg">No properties found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>

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
