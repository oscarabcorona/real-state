import { Calendar, CreditCard, FileText, Home } from "lucide-react";
import { Stats } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const cardContentClass = "mt-[-12px]";

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className={cardContentClass}>
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-8 w-[60px]" />
        </div>
        <Skeleton className="h-3 w-[120px] mt-1" />
      </CardContent>
    </Card>
  );
}

export function StatsOverview({
  stats,
  isLoading = false,
}: {
  stats: Stats;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Rented Properties
          </CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{stats.propertiesCount}</div>
            {/* {formatTrend(stats.propertiesTrend)} */}
          </div>
          <p className="text-xs text-muted-foreground">Total active rentals</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Payments
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              ${stats.totalPaid.toLocaleString()}
            </div>
            {/* {formatTrend(stats.paymentTrend)} */}
          </div>
          <p className="text-xs text-muted-foreground">
            Compared to last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Document Status</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              {Math.round(
                (stats.documentsVerified / stats.documentsTotal) * 100
              )}
              %
            </div>
            {/* {formatTrend(stats.documentsTrend)} */}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.documentsVerified} of {stats.documentsTotal} verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Viewings
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className={cardContentClass}>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{stats.upcomingViewings}</div>
            {/* {stats.nextViewingInDays > 0 && (
              <span className="text-xs text-muted-foreground">
                Next in {stats.nextViewingInDays}d
              </span>
            )} */}
          </div>
          <p className="text-xs text-muted-foreground">
            Scheduled property visits
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
