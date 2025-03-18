import { format } from "date-fns";
import { CreditCard, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { Payment } from "../../types/dashboard.types";
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
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-5 w-[90px] rounded-full" />
      </div>
    </div>
  );
}

function EmptyPayments() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <DollarSign className="h-16 w-16 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-medium">No Payment History</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm">
        You haven't made any payments yet. Start by making your first payment.
      </p>
      <Button asChild size="lg">
        <Link to="/dashboard/payments/new">
          <CreditCard className="mr-2 h-4 w-4" />
          Make First Payment
        </Link>
      </Button>
    </div>
  );
}

export function RecentPayments({
  payments,
  isLoading = false,
}: {
  payments: Payment[] | null;
  isLoading?: boolean;
}) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <PaymentCardSkeleton key={i} />
          ))}
        </>
      );
    }

    if (!payments?.length) {
      return <EmptyPayments />;
    }

    return payments.map((payment) => {
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
                {format(
                  new Date(payment.created_at ?? Date.now()),
                  "MMM d, yyyy"
                )}
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
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading payment history..."
              : payments?.length
              ? "Track your rental payments"
              : "Start managing your payments"}
          </CardDescription>
        </div>
        {!isLoading && payments && payments.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/payments">View All</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">{renderContent()}</CardContent>
    </Card>
  );
}
