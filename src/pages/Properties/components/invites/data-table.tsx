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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DataTablePagination } from "../table/data-table-pagination";
import { Loader2, Trash, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyInvite, deleteInvite } from "@/services/inviteService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataTableToolbar } from "./data-table-toolbar";

// Define meta type for the table
type InviteTableMeta = {
  onRefresh?: () => void;
};

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

interface InviteDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onNewInvite?: () => void;
  propertyId?: string;
}

export function InviteDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRefresh,
  onNewInvite,
  propertyId,
}: InviteDataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Use media query to check screen size
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery("(max-width: 768px)");

  // Set standard columns to display based on screen size
  useEffect(() => {
    // Define the standard columns that should be visible by default
    const standardVisibleColumns = {
      select: true, // Show checkboxes by default
      email: true, // Show email
      invite_type: true, // Show invite type
      status: true, // Show status
      created_at: true, // Show when it was sent
      expires_at: isMediumScreen ? false : true, // Hide on medium screens
      actions: true, // Show actions
    };

    if (isSmallScreen) {
      // For very small screens, keep only the most essential columns
      setColumnVisibility({
        ...standardVisibleColumns,
        created_at: false, // Hide sent date on very small screens
      });
    } else {
      // For all other screens, maintain the standard visible columns
      setColumnVisibility(standardVisibleColumns);
    }
  }, [isSmallScreen, isMediumScreen]);

  const table = useReactTable<TData>({
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
    } as InviteTableMeta,
  });

  // Prepare for bulk delete
  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedInvites = table
      .getSelectedRowModel()
      .rows.map((row) => (row.original as PropertyInvite).id);

    if (selectedInvites.length === 0) return;

    setIsDeleting(true);

    try {
      // Process deletions sequentially to avoid overwhelming the server
      for (const inviteId of selectedInvites) {
        await deleteInvite(inviteId);
      }

      // Clear selection
      table.resetRowSelection();

      // Show success message
      toast.success(
        t(
          "invites.actions.bulkDeleteSuccess",
          "{{count}} invitations deleted successfully",
          { count: selectedInvites.length }
        )
      );

      // Refresh the table
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting invites:", error);
      toast.error(
        t(
          "invites.actions.bulkDeleteError",
          "Failed to delete some invitations"
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DataTableToolbar
          table={table}
          onNewInvite={onNewInvite}
          propertyId={propertyId}
        />

        {table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="ml-auto gap-1 ml-2"
          >
            <Trash className="h-4 w-4" />
            {isDeleting
              ? t("invites.actions.deleting", "Deleting...")
              : t("invites.actions.deleteSelected", "Delete {{count}}", {
                  count: table.getSelectedRowModel().rows.length,
                })}
          </Button>
        )}
      </div>

      <div className="rounded-md border relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("invites.table.loading", "Loading invites...")}
            </span>
          </div>
        )}
        {!isLoading && table.getRowModel().rows?.length > 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 border-b">
            {t(
              "invites.table.selectionHelp",
              "Select invites by clicking the checkbox. Select all invites by clicking the checkbox in the header."
            )}
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
                  className={`text-sm hover:bg-muted/50 transition-colors ${
                    row.getIsSelected() ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                  id={`invite-row-${(row.original as PropertyInvite)?.id}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${
                        cell.column.id === "email" ? "font-medium" : ""
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
                      {t("invites.table.loading", "Loading invites...")}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-sm text-muted-foreground">
                        {t("invites.table.noInvitesFound", "No invites found")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(
                          "invites.table.tryAnotherFilter",
                          "Try changing the filters or invite someone new"
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t("invites.deleteAlert.title", "Confirm Deletion")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "invites.deleteAlert.description",
                "Are you sure you want to delete {{count}} invitation(s)? This action cannot be undone.",
                { count: table.getSelectedRowModel().rows.length }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting
                ? t("invites.actions.deleting", "Deleting...")
                : t("invites.deleteAlert.confirm", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
