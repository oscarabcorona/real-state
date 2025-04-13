import { Bed, Bath, Square, MapPin, Calendar, AlertCircle } from "lucide-react";
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
  // Check if the property has minimal data
  const hasMinimalData =
    !property.price &&
    (!property.bedrooms || property.bedrooms === 0) &&
    (!property.bathrooms || property.bathrooms === 0) &&
    (!property.square_feet || property.square_feet === 0);

  // Render a simplified version for minimal data
  if (hasMinimalData) {
    return (
      <div className="bg-muted/30 rounded-lg p-5">
        <h3 className="text-lg font-medium mb-4">Property Details</h3>

        <div className="space-y-4">
          {/* Property Type */}
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Property Type</span>
            <span className="font-medium capitalize">
              {property.property_type || "Not specified"}
            </span>
          </div>

          {/* Address */}
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

          {/* Available Date */}
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

          {/* Info message about completing property details */}
          <div className="mt-6 flex items-start gap-2 p-3 bg-muted rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Additional details pending</p>
              <p className="text-muted-foreground">
                This property listing is still being completed with information
                about price, bedrooms, and other details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard view for properties with complete data
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
              {property.property_type || "Not specified"}
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
