import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewingModal } from "@/components/ViewingModal";
import { fetchMarketplaceProperties } from "@/services/marketplaceService";
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Home,
  MapPin,
  ScrollText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Filters } from "./Filters";
import { Header } from "./Header";
import type { Property } from "./types";

export function Marketplace() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProperties = async () => {
    try {
      const data = await fetchMarketplaceProperties(filters);
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <AspectRatio ratio={16 / 9}>
        <div className="relative h-full">
          {property.images?.length ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
            >
              {property.property_type.charAt(0).toUpperCase() +
                property.property_type.slice(1)}
            </Badge>
            <Badge className="bg-emerald-500/80 backdrop-blur-sm text-white">
              Available Now
            </Badge>
          </div>
        </div>
      </AspectRatio>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold truncate">{property.name}</h3>
            <p className="text-lg font-bold text-primary shrink-0">
              ${property.price.toLocaleString()}/mo
            </p>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {property.address}, {property.city}, {property.state}
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
        <div className="flex gap-4 text-sm text-muted-foreground">
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
        <Button
          size="sm"
          onClick={() => {
            setSelectedProperty(property);
            setShowAppointmentModal(true);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Calendar className="h-4 w-4 mr-2" />
          View
        </Button>
      </CardFooter>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[80px]" />
          </div>
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <div className="flex gap-4 w-full">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <Header
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      {/* Filters */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
      />

      <ScrollArea className="flex-1">
        <div className="container py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-medium">No properties found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedProperty && (
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
      )}
    </div>
  );
}
