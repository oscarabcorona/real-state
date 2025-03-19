import { DollarSign, Percent, Shield, Users } from "lucide-react";
import { Stats } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="ml-5 w-0 flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string | number;
}

export function StatsCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: StatsCardProps) {
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={cn("h-6 w-6", iconClassName)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {label}
              </dt>
              <dd className="text-lg font-medium text-foreground">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsOverviewProps {
  stats?: Stats;
  loading: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return <StatsOverviewSkeleton />;
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">
          No statistics available
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Statistics will appear here once data is available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={DollarSign}
        iconClassName="text-green-500"
        label="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
      />

      <StatsCard
        icon={Percent}
        iconClassName="text-indigo-500"
        label="Occupancy Rate"
        value={`${stats.occupancyRate.toFixed(1)}%`}
      />

      <StatsCard
        icon={Users}
        iconClassName="text-blue-500"
        label="Total Tenants"
        value={stats.tenantsCount}
      />

      <StatsCard
        icon={Shield}
        iconClassName="text-purple-500"
        label="Compliance Rate"
        value={`${stats.complianceRate.toFixed(1)}%`}
      />
    </div>
  );
}
