import { Property } from "../types";
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
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={property.images?.[0] || "/placeholder-property.jpg"}
          alt={property.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <Badge
          variant={property.published ? "default" : "outline"}
          className="absolute top-2 right-2"
        >
          {property.published ? "Published" : "Draft"}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {property.address}, {property.city}, {property.state}{" "}
          {property.zip_code}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-semibold">${property.price?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Beds</p>
            <p className="font-semibold">{property.bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Baths</p>
            <p className="font-semibold">{property.bathrooms}</p>
          </div>
        </div>

        {property.property_leases?.[0]?.tenant && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Leased to: </span>
            <span className="font-medium">
              {property.property_leases[0].tenant.name}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="ghost" size="sm" onClick={() => onPublish(property)}>
          {property.published ? (
            <EyeOff className="h-4 w-4 mr-1" />
          ) : (
            <Eye className="h-4 w-4 mr-1" />
          )}
          {property.published ? "Unpublish" : "Publish"}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(property)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(property.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
