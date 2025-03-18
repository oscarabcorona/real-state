import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewingModal } from "@/components/ViewingModal";
import { fetchMarketplaceProperties } from "@/services/marketplaceService";
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Heart,
  Home,
  Info,
  MapPin,
  ScrollText,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export function Marketplace() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Use a ref for instant response when toggling filters
  const showFiltersRef = useRef(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    city: "",
    state: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows feels right for this layout

  // Ensure filter UI updates happen immediately
  const handleToggleFilters = (value: boolean) => {
    showFiltersRef.current = value;
    setShowFilters(value);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceProperties(filters);

      // Sort properties based on selected option
      const sortedData = [...data].sort((a, b) => {
        switch (sortOption) {
          case "price-low-high":
            return a.price - b.price;
          case "price-high-low":
            return b.price - a.price;
          case "bedrooms":
            return b.bedrooms - a.bedrooms;
          case "newest":
          default:
            return (
              new Date(b.available_date).getTime() -
              new Date(a.available_date).getTime()
            );
        }
      });

      setProperties(sortedData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (properties.length > 0) {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption]);

  const toggleFavorite = (id: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((fav) => fav !== id)
        : [...prevFavorites, id]
    );
  };

  const countActiveFilters = () => {
    return Object.values(filters).filter((val) => val !== "").length;
  };

  const clearAllFilters = () => {
    setFilters({
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      city: "",
      state: "",
    });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = properties.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("ellipsis");
      }

      // Show current page and surrounding pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("ellipsis");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-muted hover:border-primary/20 flex flex-col h-full">
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
        <div className="relative h-full">
          {property.images?.length ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm"
            >
              {property.property_type.charAt(0).toUpperCase() +
                property.property_type.slice(1)}
            </Badge>
            <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white">
              Available Now
            </Badge>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-4 w-4 ${
                favorites.includes(property.id)
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        </div>
      </AspectRatio>

      <CardContent className="p-4 flex-grow">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-medium truncate">{property.name}</h3>
            <p className="text-lg font-semibold text-primary shrink-0">
              ${property.price.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1 overflow-hidden">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {property.address}, {property.city}, {property.state}
            </span>
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" /> {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <ScrollText className="h-4 w-4" />{" "}
              {property.square_feet.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 bg-muted/30 flex-wrap gap-2 border-t">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setSelectedProperty(property);
            setShowDetailsModal(true);
          }}
        >
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            setSelectedProperty(property);
            setShowAppointmentModal(true);
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </CardFooter>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden h-full">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[80px]" />
          </div>
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-4 w-[40px]" />
            <Skeleton className="h-4 w-[40px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );

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
          <Select value={sortOption} onValueChange={setSortOption}>
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
          {/* Desktop Filters - Fixed the transitions and layout issues */}
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
              <Select value={sortOption} onValueChange={setSortOption}>
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

            {/* Results Grid - keep existing code */}
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
                    <PropertyCard key={property.id} property={property} />
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

      {/* Appointment Modal */}
      {selectedProperty && (
        <>
          <ViewingModal
            open={showAppointmentModal}
            onOpenChange={setShowAppointmentModal}
            propertyId={selectedProperty.id}
            userId={user?.id}
            userEmail={user?.email}
            userName={user?.full_name}
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
