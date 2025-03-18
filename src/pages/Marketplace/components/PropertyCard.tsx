import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Bath,
  Bed,
  Calendar,
  Heart,
  Home,
  Info,
  MapPin,
  ScrollText,
} from "lucide-react";
import type { Property } from "../types";

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onSchedule: (property: Property) => void;
}

export const PropertyCard = ({
  property,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onSchedule,
}: PropertyCardProps) => (
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
            onToggleFavorite(property.id);
          }}
          className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
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
        onClick={() => onViewDetails(property)}
      >
        <Info className="h-4 w-4 mr-2" />
        View Details
      </Button>
      <Button size="sm" className="flex-1" onClick={() => onSchedule(property)}>
        <Calendar className="h-4 w-4 mr-2" />
        Schedule
      </Button>
    </CardFooter>
  </Card>
);
