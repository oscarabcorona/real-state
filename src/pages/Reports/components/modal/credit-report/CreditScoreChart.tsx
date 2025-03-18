import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { cn } from "@/lib/utils";

interface CreditScoreChartProps {
  score: number;
  category: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export function CreditScoreChart({
  score,
  category,
  color,
  size = "md",
}: CreditScoreChartProps) {
  const chartConfig = {
    score: { label: "Credit Score" },
    excellent: { label: "Excellent", color: "hsl(var(--chart-1))" },
    good: { label: "Good", color: "hsl(var(--chart-2))" },
    fair: { label: "Fair", color: "hsl(var(--chart-3))" },
    poor: { label: "Poor", color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig;

  const chartData = [
    { name: "Credit Score", value: score, fill: color, category },
  ];

  // Size mappings for different chart sizes
  const sizeConfig = {
    sm: {
      width: 140,
      height: 140,
      innerRadius: 40,
      outerRadius: 55,
      textSize: "text-2xl",
      detailSize: "text-xs",
    },
    md: {
      width: 180,
      height: 180,
      innerRadius: 50,
      outerRadius: 70,
      textSize: "text-3xl",
      detailSize: "text-xs",
    },
    lg: {
      width: 220,
      height: 220,
      innerRadius: 60,
      outerRadius: 85,
      textSize: "text-4xl",
      detailSize: "text-sm",
    },
  };

  const { width, height, innerRadius, outerRadius, textSize, detailSize } =
    sizeConfig[size];

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <PieChart width={width} height={height}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="category"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={180}
          endAngle={0}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className={cn("font-bold", textSize)}
                      style={{ fill: color }}
                    >
                      {score}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + (size === "sm" ? 15 : 20)}
                      className={cn("fill-muted-foreground", detailSize)}
                    >
                      {category}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
