import * as React from "react";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, Home, BarChart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedNumber } from "@/components/animated/AnimatedNumber";
import { AnimatedElement } from "@/components/animated/AnimatedElement";

// Sample data structure - replace with actual API data
const generateSampleData = (
  labels: string[],
  revenue: number[],
  occupancy: number[]
) => {
  return labels.map((label, index) => ({
    date: label,
    revenue: isNaN(revenue[index]) ? 0 : revenue[index],
    occupancy: isNaN(occupancy[index]) ? 0 : occupancy[index],
  }));
};

const chartConfig = {
  metrics: {
    label: "Metrics",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(142, 76%, 36%)", // Emerald green
  },
  occupancy: {
    label: "Occupancy %",
    color: "hsl(226, 70%, 55%)", // Indigo blue
  },
} satisfies ChartConfig;

export function RevenueChart({
  revenueChart,
  loading = false,
}: {
  revenueChart: { data: number[]; labels: string[] };
  loading: boolean;
}) {
  const [timeRange, setTimeRange] = React.useState("90d");

  // Check if data is valid (not empty, and contains valid numbers)
  const hasValidData = React.useMemo(() => {
    if (!revenueChart?.data?.length || !revenueChart?.labels?.length)
      return false;
    if (revenueChart.data.length === 0) return false;
    if (revenueChart.data.every((val) => isNaN(val) || val === 0)) return false;
    return true;
  }, [revenueChart]);

  // Convert the provided data to the format needed for recharts
  const chartData = React.useMemo(() => {
    if (!hasValidData) return [];

    // Create sample occupancy data based on revenue - in real app, use actual occupancy data
    const maxRevenue = Math.max(
      ...revenueChart.data.filter((val) => !isNaN(val) && val > 0)
    );
    const occupancyData = revenueChart.data.map((value) =>
      isNaN(value)
        ? 0
        : Math.min(100, Math.floor((value / (maxRevenue || 1)) * 90 + 10))
    );

    return generateSampleData(
      revenueChart.labels,
      revenueChart.data,
      occupancyData
    );
  }, [revenueChart, hasValidData]);

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    let daysToShow = 90;
    if (timeRange === "30d") daysToShow = 30;
    if (timeRange === "7d") daysToShow = 7;

    return chartData.slice(-Math.min(daysToShow, chartData.length));
  }, [chartData, timeRange]);

  // Calculate totals for the selected time period
  const totals = React.useMemo(() => {
    if (filteredData.length === 0) {
      return { revenue: 0, occupancy: 0 };
    }

    const totalRevenue = filteredData.reduce(
      (acc, curr) => acc + curr.revenue,
      0
    );
    const avgOccupancy = Math.round(
      filteredData.reduce((acc, curr) => acc + curr.occupancy, 0) /
        filteredData.length
    );

    return { revenue: totalRevenue, occupancy: avgOccupancy };
  }, [filteredData]);

  // Loading skeleton for metrics
  const LoadingSkeleton = () => (
    <>
      <div className="animate-pulse space-y-2">
        <div className="h-5 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    </>
  );

  // No data message component
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-48 text-center p-4">
      <BarChart className="h-12 w-12 text-muted-foreground opacity-40 mb-2" />
      <h3 className="font-medium text-base mb-1">No revenue data available</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        Try changing the date range or check back later.
      </p>
    </div>
  );

  return (
    <Card className="shadow-sm border border-border/40 rounded-lg overflow-hidden">
      <CardHeader className="flex items-center gap-3 space-y-0 border-b py-3 sm:flex-row bg-card/50">
        <div className="grid flex-1 gap-0.5 text-center sm:text-left">
          <CardTitle className="text-lg font-medium">
            Revenue & Occupancy Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            {timeRange === "7d"
              ? "Last week"
              : timeRange === "30d"
              ? "Last month"
              : "Last quarter"}
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
          disabled={loading || !hasValidData}
        >
          <SelectTrigger
            className="w-[140px] rounded-lg sm:ml-auto bg-background h-8 text-xs"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="90d" className="rounded-md text-sm">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-md text-sm">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-md text-sm">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="flex flex-col sm:flex-row border-b bg-card/30">
        <div className="flex-1 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Total Revenue
            </span>
          </div>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="mt-1 text-2xl font-bold text-foreground">
                $<AnimatedNumber value={totals.revenue} duration={1200} />
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(), "MMM yyyy")}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Avg. Occupancy
            </span>
          </div>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="mt-1 text-2xl font-bold text-foreground">
                <AnimatedNumber
                  value={totals.occupancy}
                  duration={1200}
                  suffix="%"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {filteredData.length > 0
                  ? `${filteredData.length} day period`
                  : "No data"}
              </div>
            </>
          )}
        </div>
      </div>

      <CardContent className="px-2 pt-3 pb-2 sm:px-4">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3 h-[200px]">
            <div className="h-full w-full bg-gray-200 rounded"></div>
          </div>
        ) : !hasValidData || filteredData.length === 0 ? (
          <NoDataMessage />
        ) : (
          <AnimatedElement animation="fadeIn" duration={0.8} delay={0.3}>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillOccupancy"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-occupancy)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-occupancy)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => {
                        if (name === "revenue") return `$${value}`;
                        if (name === "occupancy") return `${value}%`;
                        return value;
                      }}
                    />
                  }
                />
                <Area
                  yAxisId="left"
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  dataKey="occupancy"
                  type="monotone"
                  fill="url(#fillOccupancy)"
                  stroke="var(--color-occupancy)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </AnimatedElement>
        )}
      </CardContent>
    </Card>
  );
}
