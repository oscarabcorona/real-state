import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";

interface CreditScoreChartProps {
  score: number;
  category: string;
  color: string;
}

export function CreditScoreChart({
  score,
  category,
  color,
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

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <PieChart width={180} height={180}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="category"
          innerRadius={50}
          outerRadius={70}
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
                      className="font-bold text-3xl"
                      style={{ fill: color }}
                    >
                      {score}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
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
