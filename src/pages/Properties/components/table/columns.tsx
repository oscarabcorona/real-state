import { ColumnDef } from "@tanstack/react-table";
import { Property } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, MapPin } from "lucide-react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableRowActions } from "./data-table-row-actions";
import { useTranslation } from "react-i18next";

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

// Define a hook to get translated column data and functions
export function usePropertyColumns() {
  const { t } = useTranslation();

  // Helper function to get translated status
  const getPropertyStatusLabel = (
    status: PropertyStatus | null | undefined
  ): string => {
    switch (status) {
      case "published":
        return t("properties.statuses.published", "Published");
      case "draft":
        return t("properties.statuses.draft", "Draft");
      default:
        return t("properties.statuses.unknown", "Unknown");
    }
  };

  // Helper function to get translated property type
  const getPropertyTypeLabel = (
    type: PropertyType | string | null | undefined
  ): string => {
    switch (type) {
      case "house":
        return t("properties.form.types.house", "House");
      case "apartment":
        return t("properties.form.types.apartment", "Apartment");
      case "condo":
        return t("properties.form.types.condo", "Condo");
      case "townhouse":
        return t("properties.form.types.townhouse", "Townhouse");
      case "land":
        return t("properties.form.types.land", "Land");
      case "commercial":
        return t("properties.form.types.commercial", "Commercial");
      default:
        return type || t("properties.form.types.unknown", "Unknown");
    }
  };

  // Define base columns with basic configuration
  const columns: ColumnDef<Property>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("common.selectAll", "Select all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("common.selectRow", "Select row")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "image",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("properties.columns.image", "Image")}
        />
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
        <DataTableColumnHeader
          column={column}
          title={t("properties.columns.property", "Property")}
        />
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
        <DataTableColumnHeader
          column={column}
          title={t("properties.columns.status", "Status")}
        />
      ),
      cell: ({ row }) => {
        const statusValue = row.original.status as PropertyStatus;
        const statusLabel = getPropertyStatusLabel(statusValue);

        return (
          <div className="flex w-[100px] items-center">
            <Badge
              variant={statusValue === "published" ? "default" : "outline"}
              className="text-xs"
            >
              {statusLabel}
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
        <DataTableColumnHeader
          column={column}
          title={t("properties.columns.type", "Type")}
        />
      ),
      cell: ({ row }) => {
        const propertyTypeValue = row.original.property_type as PropertyType;
        const propertyTypeLabel = getPropertyTypeLabel(propertyTypeValue);
        const typeInfo = propertyTypes.find(
          (type) => type.value === propertyTypeValue
        );
        const TypeIcon = typeInfo?.icon || Home;

        return (
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span>{propertyTypeLabel}</span>
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

  return columns;
}

// For backwards compatibility with existing imports
export const columns: ColumnDef<Property>[] = [];
