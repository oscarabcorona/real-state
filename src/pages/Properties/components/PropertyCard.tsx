import { Property, getSyndicationValue } from "../types";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onPublish: (property: Property) => void;
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  onPublish,
}: PropertyCardProps) {
  const hasSyndication =
    getSyndicationValue(property, "zillow") ||
    getSyndicationValue(property, "trulia") ||
    getSyndicationValue(property, "realtor") ||
    getSyndicationValue(property, "hotpads");

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute top-2 flex w-full justify-between px-2">
          <div className="flex gap-2">
            {hasSyndication && <Badge variant="secondary">Syndicated</Badge>}
          </div>
          <Badge variant={property.published ? "default" : "outline"}>
            {property.published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <CardHeader className="space-y-1">
        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
        <div className="line-clamp-1 text-sm text-muted-foreground">
          {property.address}, {property.city}, {property.state}{" "}
          {property.zip_code}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium">${property.price?.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Beds</p>
            <p className="font-medium">{property.bedrooms}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Baths</p>
            <p className="font-medium">{property.bathrooms}</p>
          </div>
        </div>

        {property.property_leases?.[0]?.tenant && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Leased to:</span>
            <span className="font-medium">
              {property.property_leases[0].tenant.name}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-2 sm:p-3">
        <div className="flex w-full items-center justify-between gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 sm:px-3"
                onClick={() => onPublish(property)}
              >
                {property.published ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
                <span className="ml-1.5 hidden sm:inline-block">
                  {property.published ? "Unpublish" : "Publish"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">
              {property.published ? "Unpublish" : "Publish"}
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:px-3"
                  onClick={() => onEdit(property)}
                >
                  <Edit className="size-4" />
                  <span className="ml-1.5 hidden sm:inline-block">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                Edit property
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 px-2 sm:px-3"
                  onClick={() => onDelete(property.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="ml-1.5 hidden sm:inline-block">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden">
                Delete property
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
