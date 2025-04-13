import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "./data-table";
import { columns, statuses, propertyTypes } from "./columns";
import { Property } from "../../types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Home,
  Building2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TranslatedTableProps {
  data: Property[];
  setIsModalOpen: (value: boolean) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onEditProperty?: (property: Property) => void;
}

// Row actions component that properly uses the useNavigate hook
const RowActions = ({ property }: { property: Property }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          {t("properties.table.rowActions.view")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/properties/${property.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t("properties.table.rowActions.edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          {t("properties.table.rowActions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function TranslatedTable({
  data,
  setIsModalOpen,
  isLoading = false,
  onRefresh,
  onEditProperty,
}: TranslatedTableProps) {
  const { t } = useTranslation();

  // Get translated statuses
  const translatedStatuses = statuses.map((status) => ({
    ...status,
    label: t(`properties.table.statusValues.${status.value}`),
  }));

  // Get translated property types
  const translatedPropertyTypes = propertyTypes.map((type) => ({
    ...type,
    label: t(`properties.table.propertyTypes.${type.value}`),
  }));

  // Create translated columns with customized cells
  const translatedColumns: ColumnDef<Property>[] = columns.map((column) => {
    // Handle special column types
    if (column.id === "image") {
      return {
        ...column,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.image")}
          />
        ),
      };
    }

    if (column.accessorKey === "name") {
      return {
        ...column,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.property")}
          />
        ),
      };
    }

    if (column.accessorKey === "status") {
      return {
        ...column,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.status")}
          />
        ),
        cell: ({ row }) => {
          const status = translatedStatuses.find(
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
      };
    }

    if (column.accessorKey === "property_type") {
      return {
        ...column,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.type")}
          />
        ),
        cell: ({ row }) => {
          const propertyType = translatedPropertyTypes.find(
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
      };
    }

    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }) => <RowActions property={row.original} />,
      };
    }

    return column;
  });

  return (
    <DataTable
      columns={translatedColumns}
      data={data}
      setIsModalOpen={setIsModalOpen}
      isLoading={isLoading}
      onRefresh={onRefresh}
      onEditProperty={onEditProperty}
    />
  );
}
