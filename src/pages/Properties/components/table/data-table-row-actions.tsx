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
import { toast } from "sonner";
import { Property } from "../../types";
import { useNavigate } from "react-router-dom";
import {
  deleteProperty,
  togglePropertyPublishStatus,
} from "@/services/propertyService";

// Custom event to refresh properties
export const PROPERTIES_REFRESH_EVENT = "properties:refresh";

// Extended Row type that includes the table property
interface ExtendedRow<TData> extends Row<TData> {
  table: {
    options: {
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
  const onEditProperty = (row as ExtendedRow<TData>).table.options.meta
    ?.onEditProperty;

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
    } catch (error: unknown) {
      console.error("Error deleting property:", error);
      toast.error("Error", {
        description: "There was an error deleting the property.",
      });
    }
  };

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
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (onEditProperty) {
              onEditProperty(property);
            } else {
              navigate(`/properties/${property.id}/edit`);
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
          onClick={handleDeleteProperty}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
