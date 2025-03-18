import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment } from "../types";

type PaymentsTableProps = {
  payments: Payment[];
  loading: boolean;
  onPaymentClick: (payment: Payment) => void;
  onDownloadInvoice: (payment: Payment) => void;
};

export function PaymentsTable({
  payments,
  loading,
  onPaymentClick,
  onDownloadInvoice,
}: PaymentsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "completed":
        return "secondary";
      case "failed":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No payments found</h3>
        <p className="text-sm text-muted-foreground">
          No payment records match your current filters.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">
              {payment.invoice_number}
            </TableCell>
            <TableCell>{payment.properties.name}</TableCell>
            <TableCell>${payment.amount.toLocaleString()}</TableCell>
            <TableCell className="capitalize">
              {payment.payment_method.replace("_", " ")}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(payment.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(payment.status)}
                  <span className="capitalize">{payment.status}</span>
                </span>
              </Badge>
            </TableCell>
            <TableCell>{payment.properties.user?.email}</TableCell>
            <TableCell>
              {new Date(payment.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {payment.status === "pending" && (
                  <Button size="sm" onClick={() => onPaymentClick(payment)}>
                    <CreditCard className="h-4 w-4 mr-1" />
                    Pay Now
                  </Button>
                )}
                {payment.invoice_file_path && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadInvoice(payment)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                )}
                {payment.receipt_file_path &&
                  payment.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadInvoice(payment)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                  )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
