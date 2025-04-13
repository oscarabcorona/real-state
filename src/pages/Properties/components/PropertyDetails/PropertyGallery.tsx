import { Home } from "lucide-react";

interface PropertyGalleryProps {
  images: string[] | null;
  propertyName: string;
}

export function PropertyGallery({
  images,
  propertyName,
}: PropertyGalleryProps) {
  const hasImages = images && images.length > 0;

  return (
    <div>
      <div
        className={`rounded-lg overflow-hidden aspect-video ${
          !hasImages ? "property-empty-state" : "bg-muted"
        }`}
      >
        {hasImages ? (
          <img
            src={images[0]}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 p-8 text-center relative z-10">
            <Home className="h-20 w-20 text-muted-foreground/40" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{propertyName}</p>
              <p>No property images available yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Image thumbnails */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.slice(1).map((image, index) => (
            <div
              key={index + 1}
              className="h-20 w-32 flex-shrink-0 rounded-md overflow-hidden"
            >
              <img
                src={image}
                alt={`${propertyName} ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
