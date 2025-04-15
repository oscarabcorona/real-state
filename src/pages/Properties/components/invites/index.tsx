import { InviteDataTable } from "./data-table";
import { useInviteColumns } from "./columns";
import { getPropertyInvites, PropertyInvite } from "@/services/inviteService";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PropertyInvitesProps {
  propertyId: string;
  onNewInvite?: () => void;
}

export function PropertyInvites({
  propertyId,
  onNewInvite,
}: PropertyInvitesProps) {
  const [invites, setInvites] = useState<PropertyInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { columns } = useInviteColumns();
  const { t } = useTranslation();

  const fetchInvites = useCallback(async () => {
    if (!propertyId) return;

    setIsLoading(true);
    try {
      const inviteData = await getPropertyInvites(propertyId);
      setInvites(inviteData);
    } catch (error) {
      console.error("Error fetching invites:", error);
      toast.error(t("invites.errors.fetchFailed", "Failed to load invites"), {
        description: t("invites.errors.tryAgain", "Please try again later"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, t]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchInvites();
    };

    window.addEventListener("refresh-invites", handleRefresh);
    return () => {
      window.removeEventListener("refresh-invites", handleRefresh);
    };
  }, [fetchInvites]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return (
    <InviteDataTable
      columns={columns}
      data={invites}
      isLoading={isLoading}
      onRefresh={fetchInvites}
      onNewInvite={onNewInvite}
      propertyId={propertyId}
    />
  );
}

// Export all components for use in other files
export { InviteDataTable } from "./data-table";
export { DataTableToolbar } from "./data-table-toolbar";
export { DataTableRowActions } from "./data-table-row-actions";
export { useInviteColumns } from "./columns";
export { InviteDialog } from "./InviteDialog";
export type { InviteStatus, InviteType } from "./columns";
