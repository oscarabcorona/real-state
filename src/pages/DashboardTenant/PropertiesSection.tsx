import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bath, Bed, Building2, MapPin, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "../../types/dashboard.types";

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <AspectRatio ratio={16 / 9}>
        <div className="h-full w-full bg-muted" />
      </AspectRatio>
      <CardHeader className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardFooter>
    </Card>
  );
}

function EmptyProperties() {
  return (
    <Card className="w-full">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle className="text-xl mb-2">No Properties Found</CardTitle>
        <CardDescription className="mb-6 max-w-sm">
          You haven't rented any properties yet. Browse our available properties
          to find your next home.
        </CardDescription>
        <Button size="lg" asChild>
          <Link to="/dashboard/marketplace">
            <Search className="h-4 w-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PropertiesSections({
  properties,
  isLoading = false,
}: {
  properties: Property[] | undefined;
  isLoading?: boolean;
}) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!properties?.length) {
      return <EmptyProperties />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/dashboard/properties/${property.id}`}
            className="block group"
          >
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
              <AspectRatio ratio={16 / 9}>
                {property.images?.[0] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.address}, {property.city}, {property.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    ${(property.price ?? 0).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Manager:</span>
                  {property.property_manager?.email ?? "Not assigned"}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  if (!properties?.length && !isLoading) {
    return <EmptyProperties />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Properties</CardTitle>
          <CardDescription>Manage your rented properties</CardDescription>
        </div>
        <Link
          to="/dashboard/marketplace"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
