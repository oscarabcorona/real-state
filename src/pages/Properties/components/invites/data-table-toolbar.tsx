import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, PlusCircle, RefreshCcw, X, CheckSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTableViewOptions } from "../table/data-table-view-options";
import { DataTableFacetedFilter } from "../table/data-table-faceted-filter";
import { statuses, inviteTypes } from "./columns";

// Define the type for the table meta
type InviteTableMeta = {
  onRefresh?: () => void;
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onNewInvite?: () => void;
  propertyId?: string;
}

export function DataTableToolbar<TData>({
  table,
  onNewInvite,
  propertyId,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const isFiltered = table.getState().columnFilters.length > 0;
  const [searchQuery, setSearchQuery] = useState("");

  // Get the number of selected rows
  const selectedRows = table.getSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    table.getColumn("email")?.setFilterValue(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    table.getColumn("email")?.setFilterValue("");
  };

  const handleRefresh = () => {
    const meta = table.options.meta as InviteTableMeta;
    if (meta?.onRefresh) {
      meta.onRefresh();
    }
  };

  // Toggle select all rows
  const handleToggleSelectAll = () => {
    table.toggleAllRowsSelected(!table.getIsAllRowsSelected());
  };

  return (
    <div className="flex-1 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center space-x-2">
        {selectedRows > 0 ? (
          <div className="flex items-center mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelectAll}
              className="h-8 px-2 gap-1 text-muted-foreground"
            >
              <CheckSquare className="h-4 w-4" />
              <span>
                {selectedRows} / {totalRows}{" "}
                {t("invites.toolbar.selected", "selected")}
              </span>
            </Button>
          </div>
        ) : (
          <div className="relative w-full sm:w-64 md:w-80">
            <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t(
                "invites.toolbar.searchByEmail",
                "Search by email"
              )}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 text-sm w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={handleClearSearch}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}

        {table.getColumn("status") && !selectedRows && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title={t("invites.toolbar.status", "Status")}
            options={statuses.map((status) => ({
              label: t(`invites.statuses.${status.value}`, status.label),
              value: status.value,
              icon: status.icon,
            }))}
          />
        )}
        {table.getColumn("invite_type") && !selectedRows && (
          <DataTableFacetedFilter
            column={table.getColumn("invite_type")}
            title={t("invites.toolbar.type", "Type")}
            options={inviteTypes.map((type) => ({
              label: t(`invites.types.${type.value}`, type.label),
              value: type.value,
              icon: type.icon,
            }))}
          />
        )}
        {isFiltered && !selectedRows && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("common.resetFilters", "Reset")}
            <span className="ml-2">×</span>
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {onNewInvite && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={onNewInvite}
            disabled={!propertyId}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{t("invites.actions.invite", "Invite")}</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
