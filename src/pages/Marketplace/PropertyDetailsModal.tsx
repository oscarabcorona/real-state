import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bath,
  Bed,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  ScrollText,
  Share,
  Tag,
} from "lucide-react";
import React from "react";
import type { Property } from "./types";

interface PropertyDetailsModalProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleViewing: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function PropertyDetailsModal({
  property,
  open,
  onOpenChange,
  onScheduleViewing,
  isFavorite,
  onToggleFavorite,
}: PropertyDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("description");

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Property Images */}
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            {property.images?.length > 0 ? (
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.name} - Image ${currentImageIndex + 1}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </AspectRatio>

          {/* Image navigation controls with better styling */}
          {property.images?.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-background/80 backdrop-blur-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </Badge>
              </div>
            </>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
            >
              {property.property_type.charAt(0).toUpperCase() +
                property.property_type.slice(1)}
            </Badge>
            <Badge className="bg-emerald-500/80 backdrop-blur-sm text-white">
              Available Now
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Property Info Header */}
        <div className="px-6 pt-6 pb-3">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h2 className="text-xl font-semibold">{property.name}</h2>
              <p className="text-2xl font-bold text-primary">
                ${property.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}, {property.state}{" "}
              {property.zip_code}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary/70" />
              <div>
                <p className="font-medium">{property.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Beds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-primary/70" />
              <div>
                <p className="font-medium">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Baths</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary/70" />
              <div>
                <p className="font-medium">
                  {property.square_feet.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Sq. Ft.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary/70" />
              <div>
                <p className="font-medium">
                  {property.pet_policy || "No pets"}
                </p>
                <p className="text-xs text-muted-foreground">Pet Policy</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-3" />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          {/* Tab Navigation */}
          <div className="px-6 pb-2">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Tab Content */}
          <ScrollArea className="flex-1 px-6">
            <TabsContent
              value="description"
              className="data-[state=active]:block mt-2"
            >
              <div className="text-sm leading-relaxed">
                {property.description ||
                  "No description available for this property."}
              </div>
            </TabsContent>

            <TabsContent
              value="amenities"
              className="data-[state=active]:block mt-2"
            >
              {property.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No amenities listed for this property.
                </p>
              )}
            </TabsContent>

            <TabsContent
              value="details"
              className="data-[state=active]:block mt-2"
            >
              <div className="grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
                <div className="flex flex-col gap-1 border-b pb-2">
                  <p className="text-muted-foreground">Available Date</p>
                  <p className="font-medium">
                    {new Date(property.available_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <p className="text-muted-foreground">Lease Terms</p>
                  <p className="font-medium">
                    {property.lease_terms || "Contact for details"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <p className="text-muted-foreground">Property Type</p>
                  <p className="font-medium">
                    {property.property_type.charAt(0).toUpperCase() +
                      property.property_type.slice(1)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <p className="text-muted-foreground">Year Built</p>
                  <p className="font-medium">Contact for details</p>
                </div>
              </div>
            </TabsContent>

            {/* Add bottom padding */}
            <div className="h-12"></div>
          </ScrollArea>
        </Tabs>

        {/* Call to Action Footer */}
        <div className="p-6 border-t bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Button
            onClick={onScheduleViewing}
            size="lg"
            className="w-full h-12 text-base"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Viewing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
