import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Payment } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusClass, getStatusIcon } from "./utils";
import { ActivitySquare, ArrowRight } from "lucide-react";
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { StaggeredList } from "@/components/animated/StaggeredList";

export function RecentActivityItem({ payment }: { payment: Payment }) {
  return (
    <div className="py-2 px-4 hover:bg-muted/30 transition-colors rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0">{getStatusIcon(payment.status)}</div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {payment.properties?.name || "Unknown Property"}
            </p>
            {payment.created_at && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(payment.created_at), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusClass(
              payment.status
            )}`}
          >
            {payment.status}
          </span>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <Skeleton className="h-6 w-[140px]" />
        <Skeleton className="h-5 w-[60px]" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-[150px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-[80px] rounded-full" />
                <Skeleton className="h-6 w-[70px]" />
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
        <AnimatedElement animation="fadeIn" duration={0.6}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ActivitySquare className="h-12 w-12 text-muted-foreground opacity-40 mb-3" />
            <h3 className="text-base font-semibold mb-1">No recent activity</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              When you receive payments or have property updates, they will
              appear here
            </p>
          </div>
        </AnimatedElement>
      );
    }

    return (
      <StaggeredList
        animation="slideLeft"
        className="divide-y divide-border/60"
        staggerDelay={0.05}
      >
        {payments.map((payment) => (
          <RecentActivityItem key={payment.id} payment={payment} />
        ))}
      </StaggeredList>
    );
  };

  return (
    <Card className="shadow-sm border border-border/40 rounded-lg overflow-hidden">
      {loading && <RecentActivitySkeleton />}

      {!loading && (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b py-3 bg-card/50">
            <CardTitle className="text-base font-medium">
              Recent Payments
            </CardTitle>
            <Link
              to="/dashboard/payments"
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View All
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 max-h-[calc(100vh-12rem)] overflow-auto">
            {renderContent()}
          </CardContent>
        </>
      )}
    </Card>
  );
}
