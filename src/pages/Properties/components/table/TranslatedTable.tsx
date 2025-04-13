import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "./data-table";
import { columns, statuses, propertyTypes } from "./columns";
import { Property } from "../../types";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface TranslatedTableProps {
  data: Property[];
  setIsModalOpen: (value: boolean) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onEditProperty?: (property: Property) => void;
}

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

  // Create a modified copy of columns for translations
  const translatedColumns = [...columns];

  // Apply translations to column headers and cells
  translatedColumns.forEach((column) => {
    if (column.id === "image") {
      column.header = ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("properties.table.columns.image")}
        />
      );
    }

    if ("accessorKey" in column) {
      if (column.accessorKey === "name") {
        column.header = ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.property")}
          />
        );
      }

      if (column.accessorKey === "status") {
        column.header = ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.status")}
          />
        );
        column.cell = ({ row }) => {
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
        };
      }

      if (column.accessorKey === "property_type") {
        column.header = ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("properties.table.columns.type")}
          />
        );
        column.cell = ({ row }) => {
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
        };
      }
    }
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
