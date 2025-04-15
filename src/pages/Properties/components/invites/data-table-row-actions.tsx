import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  RefreshCcw,
  Trash,
  Check,
  X,
  Send,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  PropertyInvite,
  resendInvite,
  deleteInvite,
  updateInviteStatus,
} from "@/services/inviteService";
import { toast } from "sonner";
import { useState } from "react";
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

interface DataTableRowActionsProps<TData> {
  row: Row<TData> & {
    table: {
      options: {
        meta?: {
          onRefresh?: () => void;
        };
      };
    };
  };
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const invite = row.original as PropertyInvite;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Handler for accepting an invite (only available for pending invites)
  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await updateInviteStatus(invite.id, "accepted");
      toast.success(t("invites.actions.acceptSuccess", "Invite accepted"));
      // Refresh data using the meta property
      if (row.table.options.meta?.onRefresh) {
        row.table.options.meta.onRefresh();
      }
    } catch (error) {
      toast.error(t("invites.actions.acceptError", "Failed to accept invite"));
      console.error("Error accepting invite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for declining an invite (only available for pending invites)
  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await updateInviteStatus(invite.id, "declined");
      toast.success(t("invites.actions.declineSuccess", "Invite declined"));
      // Refresh data using the meta property
      if (row.table.options.meta?.onRefresh) {
        row.table.options.meta.onRefresh();
      }
    } catch (error) {
      toast.error(
        t("invites.actions.declineError", "Failed to decline invite")
      );
      console.error("Error declining invite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for resending an invite
  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendInvite(invite.id);
      toast.success(t("invites.actions.resendSuccess", "Invite resent"));
      // Refresh data using the meta property
      if (row.table.options.meta?.onRefresh) {
        row.table.options.meta.onRefresh();
      }
    } catch (error) {
      toast.error(t("invites.actions.resendError", "Failed to resend invite"));
      console.error("Error resending invite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  // Handler for deleting an invite
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteInvite(invite.id);
      toast.success(t("invites.actions.deleteSuccess", "Invite deleted"));
      // Refresh data using the meta property
      if (row.table.options.meta?.onRefresh) {
        row.table.options.meta.onRefresh();
      }
      setShowDeleteAlert(false);
    } catch (error) {
      toast.error(t("invites.actions.deleteError", "Failed to delete invite"));
      console.error("Error deleting invite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("common.openMenu", "Open menu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {invite.status === "pending" && (
            <>
              <DropdownMenuItem
                onClick={handleAccept}
                disabled={isLoading}
                className="text-green-600"
              >
                <Check className="mr-2 h-4 w-4" />
                {t("invites.actions.accept", "Accept")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDecline}
                disabled={isLoading}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                {t("invites.actions.decline", "Decline")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Resend option is only available for expired or declined invites */}
          {(invite.status === "expired" || invite.status === "declined") && (
            <DropdownMenuItem onClick={handleResend} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {t("invites.actions.resend", "Resend")}
            </DropdownMenuItem>
          )}

          {/* Manually refresh an invite that is pending but old */}
          {invite.status === "pending" && (
            <DropdownMenuItem onClick={handleResend} disabled={isLoading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t("invites.actions.refresh", "Refresh")}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("invites.actions.delete", "Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                "invites.deleteAlert.singleDescription",
                "Are you sure you want to delete the invitation sent to {{email}}? This action cannot be undone.",
                { email: invite.email }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading
                ? t("invites.actions.deleting", "Deleting...")
                : t("invites.deleteAlert.confirm", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
