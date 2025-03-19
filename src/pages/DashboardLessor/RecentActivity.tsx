import { Link } from "react-router-dom";
import { Payment } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusClass, getStatusIcon } from "./utils";

export function RecentActivityItem({ payment }: { payment: Payment }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon(payment.status)}
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {payment.properties?.name || "Unknown Property"}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
              payment.status
            )}`}
          >
            {payment.status}
          </span>
          <span className="ml-4 text-sm font-medium text-foreground">
            ${payment.amount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

interface RecentActivityProps {
  payments: Payment[] | null;
  loading: boolean;
}

function RecentActivitySkeleton() {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-[140px]" />
        <Skeleton className="h-5 w-[60px]" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-[120px]" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-[70px] rounded-full" />
                <Skeleton className="h-5 w-[90px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}

export function RecentActivity({ payments, loading }: RecentActivityProps) {
  const renderContent = () => {
    if (!payments?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No recent payments</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {payments.map((payment) => (
          <RecentActivityItem key={payment.id} payment={payment} />
        ))}
      </div>
    );
  };

  return (
    <Card>
      {loading && <RecentActivitySkeleton />}

      {!loading && (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Recent Payments
            </CardTitle>
            <Link
              to="/dashboard/payments"
              className="text-sm text-primary hover:text-primary/80"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-4">{renderContent()}</CardContent>
        </>
      )}
    </Card>
  );
}
