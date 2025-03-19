import { DollarSign, Percent, Shield, Users } from "lucide-react";
import { Stats } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/animated/AnimatedNumber";
import { StaggeredList } from "@/components/animated/StaggeredList";

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="mt-[-12px]">
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
  loading = false,
}: {
  stats?: Stats;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No statistics available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StaggeredList
      animation="slideUp"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      staggerDelay={0.08}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent className="mt-[-12px]">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              $
              <AnimatedNumber
                value={stats?.totalRevenue ?? 0}
                duration={1200}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">From all properties</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Percent className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent className="mt-[-12px]">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={parseFloat(stats?.occupancyRate.toFixed(1) ?? "0")}
                duration={1200}
                suffix="%"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Average across all properties
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="mt-[-12px]">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={stats?.tenantsCount ?? 0}
                duration={1000}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Active rental agreements
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          <Shield className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent className="mt-[-12px]">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={parseFloat(stats?.complianceRate.toFixed(1) ?? "0")}
                duration={1200}
                suffix="%"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Properties meeting regulations
          </p>
        </CardContent>
      </Card>
    </StaggeredList>
  );
}
