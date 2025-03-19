import {
  AlertCircle,
  Bath,
  Bed,
  Building2,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Property } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function PropertyCardSkeleton() {
  return (
    <Card>
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted" />
      <CardContent className="p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function PropertiesOverview({
  properties,
  loading = false,
}: {
  properties: Property[] | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Properties Overview</CardTitle>
        <Button asChild disabled={loading}>
          <Link to="/dashboard/properties">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading || properties === null ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first property to get started
            </p>
            <Button asChild>
              <Link to="/dashboard/properties">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 3).map((property) => (
              <Card
                key={property.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        {
                          "bg-green-100 text-green-800":
                            property.compliance_status === "compliant",
                          "bg-yellow-100 text-yellow-800":
                            property.compliance_status === "pending",
                          "bg-red-100 text-red-800":
                            property.compliance_status === "non-compliant",
                        }
                      )}
                    >
                      {property.compliance_status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                    <span className="truncate">
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-primary">
                      ${(property.price ?? 0).toLocaleString()}/month
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span className="sr-only">Bedrooms:</span>
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span className="sr-only">Bathrooms:</span>
                        {property.bathrooms}
                      </span>
                    </div>
                  </div>
                  {property.property_leases &&
                  property.property_leases.length > 0 &&
                  property.property_leases[0].tenant ? (
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <User
                        className="h-4 w-4 mr-1 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        Tenant: {property.property_leases[0].tenant.name}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center text-sm text-yellow-600">
                      <AlertCircle
                        className="h-4 w-4 mr-1 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Vacant</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
