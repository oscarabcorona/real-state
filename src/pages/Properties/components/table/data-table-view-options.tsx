import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-9">
          <Settings2 className="h-4 w-4" />
          <span className="ml-2">{t("common.view")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>{t("common.toggleColumns")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            // Get the corresponding translated column name
            let columnName = column.id;
            if (column.id === "name") {
              columnName = t("properties.table.columns.property");
            } else if (column.id === "price") {
              columnName = t("properties.table.columns.price");
            } else if (column.id === "property_type") {
              columnName = t("properties.table.columns.type");
            } else if (column.id === "bedrooms") {
              columnName = t("properties.table.columns.bedrooms");
            } else if (column.id === "status") {
              columnName = t("properties.table.columns.status");
            } else if (column.id === "address") {
              columnName = t("properties.table.columns.address");
            } else if (column.id === "bathrooms") {
              columnName = t("properties.table.columns.bathrooms");
            } else if (column.id === "area") {
              columnName = t("properties.table.columns.area");
            }

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnName}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
