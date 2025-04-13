import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Banknote,
  DollarSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "../../utils";
import { useNavigate } from "react-router-dom";
import { DataTableColumnHeader } from "./data-table-column-header";

// Define types for payment status and methods
export type PaymentStatus = "pending" | "completed" | "failed";
export type PaymentMethod =
  | "credit_card"
  | "ach"
  | "cash"
  | "paypal"
  | "bank_transfer"
  | "check"
  | string;

// Payment statuses with icons
export const statuses = [
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
  },
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    value: "failed",
    label: "Failed",
    icon: XCircle,
  },
] as const;

// Payment methods with icons
export const paymentMethods = [
  {
    value: "credit_card",
    label: "Credit Card",
    icon: CreditCard,
  },
  {
    value: "ach",
    label: "ACH",
    icon: Banknote,
  },
  {
    value: "cash",
    label: "Cash",
    icon: DollarSign,
  },
  {
    value: "paypal",
    label: "PayPal",
    icon: DollarSign,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: Banknote,
  },
  {
    value: "check",
    label: "Check",
    icon: Banknote,
  },
] as const;

// Get variant for the status badge
const getStatusVariant = (
  status: string
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

// Get icon for payment method
export const getPaymentMethodIcon = (method: string) => {
  const foundMethod = paymentMethods.find((m) => m.value === method);
  if (foundMethod) {
    return <foundMethod.icon className="h-4 w-4 text-muted-foreground" />;
  }
  return <CreditCard className="h-4 w-4 text-muted-foreground" />;
};

// Basic actions button component - replaced with ViewActions
const ViewActions = ({ paymentId }: { paymentId: string }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => navigate(`/dashboard/payments/${paymentId}`)}
    >
      <span className="sr-only">View details</span>
      <Eye className="h-4 w-4" />
    </Button>
  );
};

// Define columns for the payments table
export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "properties.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property" />
    ),
    cell: ({ row }) => {
      const property = row.original.properties?.name || "Unknown Property";
      return (
        <div className="font-medium max-w-[200px] truncate">{property}</div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium tabular-nums">
          {formatCurrency(row.original.amount)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.original.status);

      if (!status) {
        return null;
      }

      return (
        <div className="flex items-center">
          <Badge
            variant={getStatusVariant(row.original.status)}
            className="capitalize"
          >
            {status.label}
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
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const method = paymentMethods.find(
        (m) => m.value === row.original.payment_method
      );

      const methodName =
        method?.label ||
        row.original.payment_method.replace("_", " ").toUpperCase();

      return (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon(row.original.payment_method)}
          <span>{methodName}</span>
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
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return <div>{formatDate(row.original.created_at)}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] truncate">
          {row.original.description || "No description"}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <ViewActions paymentId={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
];
