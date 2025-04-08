import { ColumnDef } from "@tanstack/react-table";
import { Property } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, MapPin, DollarSign } from "lucide-react";
import { DataTableRowActions } from "./data-table-row-actions";
import { formatPrice } from "@/lib/utils";

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
];

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
];

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
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{formatPrice(row.original.price)}</div>
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
      const type = propertyTypes.find(
        (type) => type.value === row.original.property_type
      );

      if (!type) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          {type.icon && <type.icon className="h-4 w-4 text-muted-foreground" />}
          <div>{type.label}</div>
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
    accessorKey: "bedrooms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Beds" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.bedrooms}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
