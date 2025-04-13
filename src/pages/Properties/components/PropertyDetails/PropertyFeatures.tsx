import { FileText, ListChecks } from "lucide-react";

interface PropertyFeaturesProps {
  description: string | null;
  amenities: string[] | null;
}

export function PropertyFeatures({
  description,
  amenities,
}: PropertyFeaturesProps) {
  const hasAmenities = amenities && amenities.length > 0;
  const hasDescription = description && description.trim().length > 0;
  const hasNoData = !hasDescription && !hasAmenities;

  // For properties with absolutely no data
  if (hasNoData) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/20 p-6 flex flex-col items-center justify-center text-center property-empty-state">
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-3 relative z-10" />
        <h3 className="text-lg font-medium mb-1 relative z-10">
          No details available
        </h3>
        <p className="text-sm text-muted-foreground relative z-10">
          This property doesn't have a description or amenities listed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property description */}
      <div>
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Description
        </h3>
        <p className="text-muted-foreground">
          {hasDescription ? description : "No description provided."}
        </p>
      </div>

      {/* Property amenities */}
      {hasAmenities && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
