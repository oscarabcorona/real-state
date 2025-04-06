import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bath,
  Bed,
  CalendarClock,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Home,
  MapPin,
  Share2,
  Square,
  Trash2,
  Users,
  Globe,
} from "lucide-react";
import { Property, getSyndicationValue, formatArea } from "../types";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onPublish: (property: Property) => void;
  viewMode?: "grid" | "list";
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  onPublish,
  viewMode = "grid",
}: PropertyCardProps) {
  const navigate = useNavigate();

  const hasSyndication =
    getSyndicationValue(property, "zillow") ||
    getSyndicationValue(property, "trulia") ||
    getSyndicationValue(property, "realtor") ||
    getSyndicationValue(property, "hotpads");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = () => {
    navigate(`/dashboard/properties/${property.id}`);
  };

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          <div
            className="relative w-full sm:w-48 h-40 cursor-pointer"
            onClick={handleViewDetails}
          >
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted">
                <Home className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={property.published ? "default" : "outline"}>
                {property.published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="font-semibold text-lg cursor-pointer hover:text-primary"
                  onClick={handleViewDetails}
                >
                  {property.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {property.address}, {property.city}, {property.state}{" "}
                  {property.zip_code}
                </div>
                {property.region && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Globe className="h-3 w-3 mr-1" />
                    Region: {property.region.replace(/_/g, " ")}
                  </div>
                )}
              </div>
              <div className="text-xl font-bold">
                {property.price
                  ? `$${property.price.toLocaleString()}`
                  : "Price not set"}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center text-sm">
                <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{property.bedrooms || 0} beds</span>
              </div>
              <div className="flex items-center text-sm">
                <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{property.bathrooms || 0} baths</span>
              </div>
              <div className="flex items-center text-sm">
                <Square className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{formatArea(property)}</span>
              </div>
              {property.property_type && (
                <Badge variant="outline">{property.property_type}</Badge>
              )}
              {property.available_date && (
                <div className="flex items-center text-sm">
                  <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>Available: {formatDate(property.available_date)}</span>
                </div>
              )}
            </div>

            {property.property_leases?.[0]?.tenant && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Leased to:</span>
                <span className="font-medium">
                  {property.property_leases[0].tenant.name}
                </span>
              </div>
            )}

            <div className="flex items-center mt-4 justify-between">
              <div className="flex gap-1">
                {hasSyndication && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    Syndicated
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onPublish(property)}
                    >
                      {property.published ? (
                        <>
                          <EyeOff className="size-4" />
                          <span className="ml-1.5">Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          <span className="ml-1.5">Show</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {property.published
                      ? "Hide from public view"
                      : "Make property visible to public"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => onEdit(property)}
                    >
                      <Edit className="size-4" />
                      <span className="ml-1.5">Edit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Edit property details
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{property.name}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(property.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Delete this property
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <div
          className="h-full w-full cursor-pointer"
          onClick={handleViewDetails}
        >
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="absolute top-2 flex w-full justify-between px-2">
          <div className="flex gap-2">
            {hasSyndication && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Syndicated
              </Badge>
            )}
            {property.property_type && (
              <Badge variant="outline" className="bg-white/70 backdrop-blur-sm">
                {property.property_type}
              </Badge>
            )}
          </div>
          <Badge
            variant={property.published ? "default" : "outline"}
            className={
              property.published
                ? "bg-green-600"
                : "bg-white/70 backdrop-blur-sm"
            }
          >
            {property.published ? "Published" : "Draft"}
          </Badge>
        </div>
        {property.price && (
          <div className="absolute bottom-0 left-0 m-2">
            <Badge className="bg-primary text-white text-sm py-1 px-2 flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-0.5" />
              {property.price.toLocaleString()}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="space-y-1 pb-2">
        <CardTitle
          className="line-clamp-1 cursor-pointer hover:text-primary"
          onClick={handleViewDetails}
        >
          {property.name}
        </CardTitle>
        <div className="line-clamp-1 text-sm text-muted-foreground flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          {property.address}, {property.city}
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-0 flex-1">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1 flex flex-col items-center">
            <div className="flex items-center text-muted-foreground">
              <Bed className="h-4 w-4" />
            </div>
            <p className="font-medium">{property.bedrooms || 0}</p>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="flex items-center text-muted-foreground">
              <Bath className="h-4 w-4" />
            </div>
            <p className="font-medium">{property.bathrooms || 0}</p>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="flex items-center text-muted-foreground">
              <Square className="h-4 w-4" />
            </div>
            <p className="font-medium">{formatArea(property)}</p>
          </div>
        </div>

        {property.property_leases?.[0]?.tenant && (
          <div className="mt-4 flex items-center gap-2 text-sm border-t pt-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Leased to:</span>
            <span className="font-medium">
              {property.property_leases[0].tenant.name}
            </span>
          </div>
        )}

        {property.available_date && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <CalendarClock className="h-3.5 w-3.5 mr-1" />
            <span>Available: {formatDate(property.available_date)}</span>
          </div>
        )}

        {property.region && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <Globe className="h-3.5 w-3.5 mr-1" />
            <span>Region: {property.region.replace(/_/g, " ")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-2 mt-auto">
        <div className="flex w-full items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-10 px-0"
                onClick={() => onPublish(property)}
              >
                {property.published ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {property.published
                ? "Hide from public view"
                : "Make property visible to public"}
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-10 px-0"
                  onClick={() => onEdit(property)}
                >
                  <Edit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Edit property details</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-10 px-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Property</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{property.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(property.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent side="top">Delete this property</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
