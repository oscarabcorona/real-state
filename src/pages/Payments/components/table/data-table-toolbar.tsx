import { Table } from "@tanstack/react-table";
import { X, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { paymentMethods, statuses } from "./columns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PaymentFilters } from "../../types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onExport?: () => void;
  filters?: PaymentFilters;
  setFilters?: React.Dispatch<React.SetStateAction<PaymentFilters>>;
  resetFilters?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onExport,
  filters,
  setFilters,
  resetFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-4 py-4">
      {/* Top row: Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder={t("payments.table.filterPlaceholder")}
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
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

      {/* Bottom row: Filters, View options, and Export button */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`${
            showFilters ? "flex" : "hidden md:flex"
          } flex-wrap items-center gap-2 mr-auto`}
        >
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title={t("payments.table.statusFilter")}
              options={[...statuses]}
            />
          )}
          {table.getColumn("payment_method") && (
            <DataTableFacetedFilter
              column={table.getColumn("payment_method")}
              title={t("payments.table.methodFilter")}
              options={[...paymentMethods]}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3"
            >
              {t("payments.table.resetFilters")}
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action buttons in a flex row that stays together */}
        <div className="flex items-center gap-2 shrink-0">
          <DataTableViewOptions table={table} />
          {onExport && (
            <Button
              onClick={onExport}
              variant="outline"
              className="h-9 whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" />
              <span>{t("payments.table.export")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
