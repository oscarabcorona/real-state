import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Clock,
  UserPlus,
  User,
  UserCog,
  Users,
  Wrench,
  Briefcase,
  Gavel,
} from "lucide-react";
import { DataTableColumnHeader } from "../table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { useTranslation } from "react-i18next";
import { PropertyInvite } from "@/services/inviteService";
import { format } from "date-fns";

// Define static types
export type InviteStatus = "pending" | "accepted" | "declined" | "expired";
export type InviteType = "tenant" | "lawyer" | "contractor" | "agent";

// Non-translated statuses (fallbacks)
export const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: User,
  },
  {
    value: "declined",
    label: "Declined",
    icon: UserPlus,
  },
  {
    value: "expired",
    label: "Expired",
    icon: Clock,
  },
] as const;

// Non-translated invite types (fallbacks)
export const inviteTypes = [
  {
    value: "tenant",
    label: "Tenant",
    icon: Users,
  },
  {
    value: "lawyer",
    label: "Lawyer",
    icon: Gavel,
  },
  {
    value: "contractor",
    label: "Contractor",
    icon: Wrench,
  },
  {
    value: "agent",
    label: "Agent",
    icon: Briefcase,
  },
] as const;

// Define a hook to get translated column data and functions
export function useInviteColumns() {
  const { t } = useTranslation();

  // Helper function to get translated status
  const getInviteStatusLabel = (
    status: InviteStatus | null | undefined
  ): string => {
    switch (status) {
      case "pending":
        return t("invites.statuses.pending", "Pending");
      case "accepted":
        return t("invites.statuses.accepted", "Accepted");
      case "declined":
        return t("invites.statuses.declined", "Declined");
      case "expired":
        return t("invites.statuses.expired", "Expired");
      default:
        return t("invites.statuses.unknown", "Unknown");
    }
  };

  // Helper function to get translated invite type
  const getInviteTypeLabel = (
    type: InviteType | string | null | undefined
  ): string => {
    switch (type) {
      case "tenant":
        return t("invites.types.tenant", "Tenant");
      case "lawyer":
        return t("invites.types.lawyer", "Lawyer");
      case "contractor":
        return t("invites.types.contractor", "Contractor");
      case "agent":
        return t("invites.types.agent", "Agent");
      default:
        return type || t("invites.types.unknown", "Unknown");
    }
  };

  // Define base columns with basic configuration
  const columns: ColumnDef<PropertyInvite>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("common.selectAll", "Select all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("common.selectRow", "Select row")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("invites.columns.email", "Email")}
        />
      ),
      cell: ({ row }) => {
        const invite = row.original;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium">{invite.email}</div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "invite_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("invites.columns.type", "Type")}
        />
      ),
      cell: ({ row }) => {
        const inviteTypeValue = row.original.invite_type as InviteType;
        const inviteTypeLabel = getInviteTypeLabel(inviteTypeValue);
        const typeInfo = inviteTypes.find(
          (type) => type.value === inviteTypeValue
        );
        const TypeIcon = typeInfo?.icon || UserPlus;

        return (
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span>{inviteTypeLabel}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("invites.columns.status", "Status")}
        />
      ),
      cell: ({ row }) => {
        const statusValue = row.original.status as InviteStatus;
        const statusLabel = getInviteStatusLabel(statusValue);

        const getStatusVariant = (status: InviteStatus) => {
          switch (status) {
            case "accepted":
              return "default";
            case "pending":
              return "secondary";
            case "declined":
              return "destructive";
            case "expired":
              return "outline";
            default:
              return "secondary";
          }
        };

        return (
          <div className="flex w-[100px] items-center">
            <Badge variant={getStatusVariant(statusValue)} className="text-xs">
              {statusLabel}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("invites.columns.sentAt", "Sent At")}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm">
              {format(date, "MMM d, yyyy")}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "expires_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("invites.columns.expiresAt", "Expires At")}
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.expires_at);
        return (
          <div className="flex items-center">
            <span className="text-muted-foreground text-sm">
              {format(date, "MMM d, yyyy")}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];

  return {
    columns,
    getInviteStatusLabel,
    getInviteTypeLabel,
  };
}
