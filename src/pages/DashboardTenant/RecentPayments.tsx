import { format } from "date-fns";
import { CreditCard, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { Payment } from "./types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function getPaymentStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        variant: "default" as const,
        label: "Completed",
      };
    case "pending":
      return {
        variant: "warning" as const,
        label: "Pending",
      };
    case "failed":
      return {
        variant: "destructive" as const,
        label: "Failed",
      };
    default:
      return {
        variant: "outline" as const,
        label: status,
      };
  }
}

function PaymentCardSkeleton() {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-5 w-[70px] rounded-full" />
      </div>
    </div>
  );
}

export function RecentPayments({
  payments,
  isLoading = false,
}: {
  payments: Payment[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Track your rental payments</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/payments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <>
            <PaymentCardSkeleton />
            <PaymentCardSkeleton />
            <PaymentCardSkeleton />
          </>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 font-medium">No payments</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You haven't made any payments yet.
            </p>
            <Button asChild>
              <Link to="/dashboard/payments/new">Make Payment</Link>
            </Button>
          </div>
        ) : (
          payments.map((payment) => {
            const status = getPaymentStatusConfig(payment.status);
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {payment.properties?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                  <span className="text-sm font-medium">
                    ${payment.amount.toLocaleString()}
                  </span>
                  <Badge
                    variant={status.variant}
                    className="px-2 py-0.5 text-xs font-medium capitalize"
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
