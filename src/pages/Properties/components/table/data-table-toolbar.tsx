import { Table } from "@tanstack/react-table";
import { X, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { propertyTypes, statuses } from "./columns";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setIsModalOpen: (value: boolean) => void;
}

export function DataTableToolbar<TData>({
  table,
  setIsModalOpen,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-4 py-4">
      {/* Top row: Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder={t("properties.table.filterPlaceholder")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-full max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="md:hidden h-9"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom row: Filters, View options, and Add button */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`${
            showFilters ? "flex" : "hidden md:flex"
          } flex-wrap items-center gap-2 mr-auto`}
        >
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title={t("properties.table.statusFilter")}
              options={[...statuses]}
            />
          )}
          {table.getColumn("property_type") && (
            <DataTableFacetedFilter
              column={table.getColumn("property_type")}
              title={t("properties.table.typeFilter")}
              options={[...propertyTypes]}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3"
            >
              {t("properties.table.resetFilters")}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action buttons in a flex row that stays together */}
        <div className="flex items-center gap-2 shrink-0">
          <DataTableViewOptions table={table} />
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {t("properties.table.addProperty")}
            </span>
            <span className="sm:hidden">{t("properties.table.add")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
