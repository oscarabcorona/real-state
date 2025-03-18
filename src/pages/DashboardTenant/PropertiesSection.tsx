import { Bath, Bed, Building2, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "./types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function PropertiesSections({
  properties,
  isLoading = false,
}: {
  properties: Property[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Properties</CardTitle>
          <CardDescription>Manage your rented properties</CardDescription>
        </div>
        <Link
          to="/dashboard/marketplace"
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? [...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)
            : properties.map((property) => (
                <Link
                  key={property.id}
                  to={`/dashboard/properties/${property.id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
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
                          ${property.price.toLocaleString()}
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
      </CardContent>
    </Card>
  );
}
