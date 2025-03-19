import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  XCircle,
  CalendarIcon,
  Building,
  User,
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
import { Card } from "@/components/ui/card";

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

  // Render mobile view with cards
  const renderMobileView = () => (
    <div className="space-y-4 md:hidden">
      {payments.map((payment) => (
        <Card key={payment.id} className="overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <div className="font-medium">{payment.invoice_number}</div>
              <div className="text-sm text-muted-foreground">
                ${payment.amount.toLocaleString()}
              </div>
            </div>
            <Badge variant={getStatusVariant(payment.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(payment.status)}
                <span className="capitalize">{payment.status}</span>
              </span>
            </Badge>
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{payment.properties.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(payment.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="capitalize flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {payment.payment_method.replace("_", " ")}
              </div>
              {payment.properties.user?.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">
                    {payment.properties.user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex flex-wrap gap-2 justify-end">
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
              {payment.receipt_file_path && payment.status === "completed" && (
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
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      {renderMobileView()}

      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead className="hidden lg:table-cell">Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Created By</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.invoice_number}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {payment.properties.name}
                </TableCell>
                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                <TableCell className="hidden md:table-cell capitalize">
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
                <TableCell className="hidden xl:table-cell">
                  {payment.properties.user?.email}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {payment.status === "pending" && (
                      <Button size="sm" onClick={() => onPaymentClick(payment)}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Pay Now</span>
                      </Button>
                    )}
                    {payment.invoice_file_path && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadInvoice(payment)}
                      >
                        <FileText className="h-4 w-4 md:mr-1" />
                        <span className="hidden md:inline">Invoice</span>
                      </Button>
                    )}
                    {payment.receipt_file_path &&
                      payment.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDownloadInvoice(payment)}
                        >
                          <Download className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Receipt</span>
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
