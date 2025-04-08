import { Bed, Bath, Square, MapPin, Calendar } from "lucide-react";
import { Property } from "../../types";
import {
  formatPropertyPrice,
  parseSquareFootage,
  formatDate,
  formatPropertyAddress,
} from "../../utils/property-utils";

interface PropertyInformationProps {
  property: Property;
}

export function PropertyInformation({ property }: PropertyInformationProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-5">
      <h3 className="text-lg font-medium mb-4">Property Details</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-medium">
              {formatPropertyPrice(property.price)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Property Type</span>
            <span className="font-medium capitalize">
              {property.property_type || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">{property.bedrooms || 0}</span>
              <span className="text-xs text-muted-foreground ml-1">Beds</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">{property.bathrooms || 0}</span>
              <span className="text-xs text-muted-foreground ml-1">Baths</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium">
                {parseSquareFootage(property)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{property.address}</div>
              <div className="text-sm text-muted-foreground">
                {formatPropertyAddress(property)}
              </div>
            </div>
          </div>
        </div>

        {property.available_date && (
          <div className="pt-2 flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">
                Available From
              </div>
              <div className="font-medium">
                {formatDate(property.available_date)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
