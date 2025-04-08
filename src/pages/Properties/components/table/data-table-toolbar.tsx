import { Table } from "@tanstack/react-table";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { propertyTypes, statuses } from "./columns";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setIsModalOpen: (value: boolean) => void;
}

export function DataTableToolbar<TData>({
  table,
  setIsModalOpen,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Filter properties..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-9 w-[250px] lg:w-[300px]"
        />

        <div className="flex-1 space-x-2">
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("property_type") && (
            <DataTableFacetedFilter
              column={table.getColumn("property_type")}
              title="Type"
              options={propertyTypes}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center ml-auto gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  );
}
