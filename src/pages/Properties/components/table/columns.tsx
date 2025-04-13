import { ColumnDef } from "@tanstack/react-table";
import { Property } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, MapPin } from "lucide-react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableRowActions } from "./data-table-row-actions";

// Define static types
export type PropertyStatus = "published" | "draft";
export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "townhouse"
  | "land"
  | "commercial";

// Non-translated statuses (fallbacks)
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

// Non-translated property types (fallbacks)
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

// Define base columns with basic configuration
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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      // This will be patched by the TranslatedTable wrapper
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
      // This will be patched by the TranslatedTable wrapper
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
