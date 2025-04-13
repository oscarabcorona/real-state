import { Row } from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { Property } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  deleteProperty,
  togglePropertyPublishStatus,
} from "@/services/propertyService";
import { useState } from "react";

// Custom event to refresh properties
export const PROPERTIES_REFRESH_EVENT = "properties:refresh";

// Extended Row interface for TanStack table's row
interface RowWithTable<TData> extends Row<TData> {
  table?: {
    options?: {
      meta?: {
        onEditProperty?: (property: Property) => void;
      };
    };
  };
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const property = row.original as Property;
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Safely access the onEditProperty function with optional chaining
  const rowWithTable = row as RowWithTable<TData>;
  const onEditProperty = rowWithTable.table?.options?.meta?.onEditProperty;

  const triggerRefresh = () => {
    // Dispatch a custom event to trigger a refresh
    const refreshEvent = new CustomEvent(PROPERTIES_REFRESH_EVENT);
    window.dispatchEvent(refreshEvent);
  };

  const handleToggleStatus = async () => {
    try {
      await togglePropertyPublishStatus(property);

      if (property.status === "published") {
        toast.success("Property unpublished", {
          description: "The property has been unpublished successfully.",
        });
      } else {
        toast.success("Property published", {
          description: "The property has been published successfully.",
        });
      }

      // Trigger a refresh
      triggerRefresh();
    } catch (error: unknown) {
      console.error("Error toggling property status:", error);
      toast.error("Error", {
        description: "There was an error updating the property status.",
      });
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await deleteProperty(property.id);
      toast.success("Property deleted", {
        description: "The property has been deleted successfully.",
      });

      // Trigger a refresh
      triggerRefresh();

      // Close the dialog
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error deleting property:", error);
      toast.error("Error", {
        description: "There was an error deleting the property.",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 p-0 bg-muted/20 hover:bg-muted focus:ring-2 focus:ring-primary/20 data-[state=open]:bg-muted"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-6 w-6 text-gray-800" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] z-50">
          <DropdownMenuItem
            onClick={() => navigate(`/dashboard/properties/${property.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (onEditProperty) {
                onEditProperty(property);
              } else {
                navigate(`/dashboard/properties/${property.id}?edit=true`);
              }
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleStatus}>
            {property.status === "published" ? (
              <>
                <FileX className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "
              {property.name}" and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
