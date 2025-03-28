import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bath, Bed, Calendar, Heart, Home, Ruler, MapPin } from "lucide-react";
import type { Property } from "../types";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onSchedule: (property: Property) => void;
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onSchedule,
}: PropertyCardProps) {
  return (
    <Card
      className="group overflow-hidden border hover:border-primary/50 transition-colors duration-300"
      onClick={() => onViewDetails(property)}
    >
      <div className="relative">
        <AspectRatio ratio={4 / 3} className="bg-muted">
          {property.images?.length ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="object-cover w-full h-full rounded-t-lg"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-white/90 text-gray-900 font-medium"
        >
          {property.property_type}
        </Badge>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-semibold text-lg leading-tight">
                {property.name}
              </h3>
              <p className="font-semibold text-lg whitespace-nowrap">
                ${property.price.toLocaleString()}
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span>{property.square_feet.toLocaleString()} sqft</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSchedule(property);
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
