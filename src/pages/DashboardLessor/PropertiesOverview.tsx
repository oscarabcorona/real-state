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
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { StaggeredList } from "@/components/animated/StaggeredList";

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
    <Card className="shadow-sm border border-border/40 rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b py-3 bg-card/50">
        <CardTitle className="text-base font-medium">
          Properties Overview
        </CardTitle>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3 text-xs"
          disabled={loading}
        >
          <Link to="/dashboard/properties">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Property
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {loading || properties === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <AnimatedElement animation="fadeIn" duration={0.6}>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground opacity-40 mb-3" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                Add your first property to get started
              </p>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
                size="sm"
              >
                <Link to="/dashboard/properties">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Your First Property
                </Link>
              </Button>
            </div>
          </AnimatedElement>
        ) : (
          <StaggeredList
            animation="slideUp"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
            initialDelay={0.2}
          >
            {properties.slice(0, 3).map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden border border-border/60 hover:shadow-sm transition-all duration-300 hover:border-border"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <Building2 className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
                        {
                          "bg-emerald-100 text-emerald-800 border border-emerald-200":
                            property.compliance_status === "compliant",
                          "bg-amber-100 text-amber-800 border border-amber-200":
                            property.compliance_status === "pending",
                          "bg-rose-100 text-rose-800 border border-rose-200":
                            property.compliance_status === "non-compliant",
                        }
                      )}
                    >
                      {property.compliance_status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-base leading-tight line-clamp-1">
                        {property.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">
                          {property.address}, {property.city}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-base font-medium text-primary">
                        ${(property.price ?? 0).toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Bed
                            className="h-3 w-3 mr-1 text-muted-foreground/70"
                            aria-hidden="true"
                          />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center">
                          <Bath
                            className="h-3 w-3 mr-1 text-muted-foreground/70"
                            aria-hidden="true"
                          />
                          {property.bathrooms}
                        </span>
                      </div>
                    </div>

                    {property.property_leases &&
                    property.property_leases.length > 0 &&
                    property.property_leases[0].tenant ? (
                      <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                        <User
                          className="h-3 w-3 mr-1 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate font-medium">
                          {property.property_leases[0].tenant.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                        <AlertCircle
                          className="h-3 w-3 mr-1 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="font-medium">Vacant</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggeredList>
        )}
      </CardContent>
    </Card>
  );
}
