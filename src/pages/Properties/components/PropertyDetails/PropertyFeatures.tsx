interface PropertyFeaturesProps {
  description: string | null;
  amenities: string[] | null;
}

export function PropertyFeatures({
  description,
  amenities,
}: PropertyFeaturesProps) {
  const hasAmenities = amenities && amenities.length > 0;

  return (
    <div className="space-y-6">
      {/* Property description */}
      <div>
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <p className="text-muted-foreground">
          {description || "No description provided."}
        </p>
      </div>

      {/* Property amenities */}
      {hasAmenities && (
        <div>
          <h3 className="text-lg font-medium mb-3">Amenities</h3>
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
