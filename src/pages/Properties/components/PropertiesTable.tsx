import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Edit,
  Eye,
  EyeOff,
  Home,
  MapPin,
  Trash2,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { Property } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PropertiesTableProps = {
  properties: Property[];
  loading: boolean;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onPublish: (property: Property) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
};

export function PropertiesTable({
  properties,
  loading,
  onEdit,
  onDelete,
  onPublish,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PropertiesTableProps) {
  const getPropertyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "house":
        return <Home className="h-4 w-4 text-primary" />;
      case "apartment":
        return <Building2 className="h-4 w-4 text-primary" />;
      default:
        return <Building2 className="h-4 w-4 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No properties found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or add a new property
        </p>
      </div>
    );
  }

  // Render mobile view with cards
  const renderMobileView = () => (
    <div className="space-y-4 md:hidden px-2 py-4">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <div className="font-medium">{property.name}</div>
              <div className="text-sm text-muted-foreground">
                ${property.price?.toLocaleString() || "N/A"}
              </div>
            </div>
            <Badge variant={property.published ? "secondary" : "outline"}>
              <span className="flex items-center gap-1">
                {property.published ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span>{property.published ? "Published" : "Draft"}</span>
              </span>
            </Badge>
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {property.address}, {property.city}, {property.state}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>{property.bedrooms || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>{property.bathrooms || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>{property.square_feet || 0} ft²</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPropertyTypeIcon(property.property_type || "")}
                <span className="capitalize">{property.property_type}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(property)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPublish(property)}
              >
                {property.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Publish
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(property.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderMobileView()}

      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead className="hidden xl:table-cell">Beds/Baths</TableHead>
              <TableHead className="hidden lg:table-cell">Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getPropertyTypeIcon(property.property_type || "")}
                    <span>{property.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {property.address}, {property.city}
                </TableCell>
                <TableCell>
                  ${property.price?.toLocaleString() || "N/A"}
                </TableCell>
                <TableCell className="hidden lg:table-cell capitalize">
                  {property.property_type || "Unknown"}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {property.bedrooms || 0} bd / {property.bathrooms || 0} ba
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {property.square_feet?.toLocaleString() || "N/A"} ft²
                </TableCell>
                <TableCell>
                  <Badge variant={property.published ? "secondary" : "outline"}>
                    <span className="flex items-center gap-1">
                      {property.published ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      <span>{property.published ? "Published" : "Draft"}</span>
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPublish(property)}
                    >
                      {property.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pb-6">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{properties.length}</span> of{" "}
          <span className="font-medium">{totalItems}</span> properties
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;

                // Show first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Show ellipsis for gaps
                if (page === 2 || page === totalPages - 1) {
                  return <PaginationEllipsis key={page} />;
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
