import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Simple inline implementation of useMediaQuery to avoid import issues
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
    return undefined;
  }, [query]);

  return matches;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onEditProperty?: (property: TData) => void;
  onCreateProperty?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRefresh,
  onEditProperty,
  onCreateProperty,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { t } = useTranslation();

  // Use media query to check screen size
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 768px)");

  // Set standard columns to display based on the screenshot
  useEffect(() => {
    // Define the standard columns that should be visible by default
    const standardVisibleColumns = {
      select: false, // Hide checkboxes
      image: true, // Show image
      name: true, // Show property name/title
      status: true, // Show status
      property_type: true, // Show type
      bedrooms: true, // Show bedrooms
      actions: true, // Show actions

      // Hide other columns
      price: false,
      address: false,
      bathrooms: false,
      area: false,
    };

    if (isSmallScreen) {
      // For very small screens, keep only the most essential columns
      setColumnVisibility({
        ...standardVisibleColumns,
        bedrooms: false, // Hide bedrooms on very small screens
      });
    } else {
      // For all other screens, maintain the standard visible columns
      setColumnVisibility(standardVisibleColumns);
    }
  }, [isSmallScreen, isMediumScreen]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    meta: {
      onRefresh,
      onEditProperty,
    },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onCreateProperty={onCreateProperty} />
      <div className="rounded-md border relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("properties.table.loading")}
            </span>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-sm font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="text-sm hover:bg-muted/50 transition-colors"
                  id={`property-row-${(row.original as { id: string })?.id}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${
                        cell.column.id === "name" ? "font-medium" : ""
                      } ${
                        cell.column.id === "actions" ? "p-0 text-center" : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <span className="text-muted-foreground">
                      {t("properties.table.loading")}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-sm text-muted-foreground">
                        {t("properties.table.noPropertiesFound")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("properties.table.tryAnotherFilter")}
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
