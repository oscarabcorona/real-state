import { ColumnDef } from "@tanstack/react-table";
import { Property } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Building2,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import the row actions directly
import { Row } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const statuses = [
  {
    value: "published",
    label: "Published",
    icon: Home,
  },
  {
    value: "draft",
    label: "Draft",
    icon: Building2,
  },
] as const;

// Create a union type for status values to improve type safety
export type PropertyStatus = (typeof statuses)[number]["value"];

export const propertyTypes = [
  {
    value: "house",
    label: "House",
    icon: Home,
  },
  {
    value: "apartment",
    label: "Apartment",
    icon: Building2,
  },
  {
    value: "condo",
    label: "Condo",
    icon: Building2,
  },
  {
    value: "townhouse",
    label: "Townhouse",
    icon: Home,
  },
  {
    value: "land",
    label: "Land",
    icon: MapPin,
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: Building2,
  },
] as const;

// Create a union type for property types to improve type safety
export type PropertyType = (typeof propertyTypes)[number]["value"];

// Use a wrapper for the row actions to avoid circular dependencies
function RowActions({ row }: { row: Row<Property> }) {
  // We'll re-implement a simplified version or use dynamic import
  const navigate = useNavigate();
  const property = row.original;

  // This would typically be the DataTableRowActions component
  // For now, creating a simplified version to avoid import issues
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/properties/${property.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Property>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const property = row.original;
      const firstImage =
        property.images && property.images.length > 0
          ? property.images[0]
          : null;

      // Get property initials for fallback
      const initials = property.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      return (
        <div className="flex items-center justify-center">
          <Avatar className="h-10 w-10 border border-border">
            {firstImage ? (
              <AvatarImage
                src={firstImage}
                alt={property.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property" />
    ),
    cell: ({ row }) => {
      const property = row.original;
      return (
        <div className="flex items-center gap-2">
          {property.property_type === "house" ? (
            <Home className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="font-medium">{property.name}</div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{row.original.address}</div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      // Prevent null values from causing format errors
      const price = row.original.price ?? 0;
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{formatPrice(price)}</div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.original.status
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge
            variant={
              row.original.status === "published" ? "default" : "outline"
            }
            className="text-xs"
          >
            {status.label}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "property_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const propertyType = propertyTypes.find(
        (type) => type.value === row.original.property_type
      );

      return (
        <div className="flex items-center gap-2">
          {propertyType?.icon && (
            <propertyType.icon className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{propertyType?.label || row.original.property_type}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "bedrooms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Beds" />
    ),
    cell: ({ row }) => {
      // Use the bedrooms property from the property data
      const bedrooms = row.original.bedrooms || 0;
      return <div className="font-medium text-center">{bedrooms}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
