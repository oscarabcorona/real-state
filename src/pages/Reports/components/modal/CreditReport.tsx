import type { Report } from "@/pages/Reports/types";
import { CreditCategories } from "./credit-report/CreditCategories";
import { CreditFactors } from "./credit-report/CreditFactors";
import { CreditScoreChart } from "./credit-report/CreditScoreChart";
import { CreditStats } from "./credit-report/CreditStats";

// Import the CreditCategory type from CreditCategories
import type { CreditCategory } from "./credit-report/CreditCategories";

export interface CreditReportProps {
  report: Report;
  variant?: "default" | "compact" | "expanded";
}

export function CreditReport({
  report,
  variant = "default",
}: CreditReportProps) {
  // Update function signature to explicitly return the correct type
  const getCreditScoreCategory = (
    score: number
  ): { category: CreditCategory; color: string } => {
    if (score >= 750)
      return { category: "Excellent", color: "hsl(var(--chart-1))" };
    if (score >= 670) return { category: "Good", color: "hsl(var(--chart-2))" };
    if (score >= 580) return { category: "Fair", color: "hsl(var(--chart-3))" };
    return { category: "Poor", color: "hsl(var(--chart-4))" };
  };

  const { category, color } = getCreditScoreCategory(report.credit_score);
  const factors = report.analysis.credit.factors;

  // Calculate the position of the score marker on the scale (0-100%)
  const scorePosition = Math.min(
    Math.max(((report.credit_score - 300) / (850 - 300)) * 100, 0),
    100
  );

  // Different layouts based on variant
  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-[150px] h-[150px]">
            <CreditScoreChart
              score={report.credit_score}
              category={category}
              color={color}
              size="sm"
            />
          </div>
        </div>

        {/* Horizontal score scale for compact view */}
        <CreditCategories currentCategory={category} orientation="horizontal" />

        {/* Key factors in a more compact layout */}
        <div className="bg-muted/20 rounded-lg p-3">
          <h3 className="text-xs font-medium mb-2">Key Credit Factors</h3>
          <div className="space-y-1">
            {factors.slice(0, 3).map((factor, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "expanded") {
    return (
      <div className="space-y-6">
        {/* Top section with score and categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center">
            <div className="w-[220px] h-[220px]">
              <CreditScoreChart
                score={report.credit_score}
                category={category}
                color={color}
                size="lg"
              />
            </div>
            <div className="mt-6 w-full max-w-xs">
              <CreditStats />
            </div>
          </div>

          <div className="h-full flex items-center justify-center">
            <CreditCategories currentCategory={category} />
          </div>
        </div>

        {/* Factors section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Key Credit Factors</h3>
            <CreditFactors factors={factors} />
          </div>

          <div className="p-4 rounded-lg border bg-muted/10">
            <h3 className="text-sm font-medium mb-3">Credit Journey</h3>
            <div className="h-[60px] relative w-full bg-muted/20 rounded-lg overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-full flex items-center px-4">
                <div
                  className="absolute h-3 rounded-full"
                  style={{
                    left: "5%",
                    width: `${scorePosition - 5}%`,
                    backgroundColor: color,
                  }}
                />
                <div
                  className="absolute size-5 rounded-full border-2 border-white shadow-md"
                  style={{
                    left: `${scorePosition}%`,
                    transform: "translateX(-50%)",
                    backgroundColor: color,
                  }}
                />

                {/* Score markers */}
                <div className="absolute text-xs text-muted-foreground -bottom-6 left-0">
                  300
                </div>
                <div className="absolute text-xs text-muted-foreground -bottom-6 left-2/4 transform -translate-x-1/2">
                  600
                </div>
                <div className="absolute text-xs text-muted-foreground -bottom-6 right-0">
                  850
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default layout - more balanced for general use
  return (
    <div className="space-y-6">
      {/* Main content in 1 column on mobile, 2 columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart column */}
        <div className="flex flex-col items-center">
          <div className="w-[180px] h-[180px]">
            <CreditScoreChart
              score={report.credit_score}
              category={category}
              color={color}
            />
          </div>
          <div className="mt-4 w-full max-w-xs">
            <CreditStats />
          </div>
        </div>

        {/* Factors column */}
        <div className="space-y-4">
          {/* Horizontal categories on smaller screens */}
          <div className="md:hidden">
            <CreditCategories
              currentCategory={category}
              orientation="horizontal"
            />
          </div>

          {/* Key factors */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Key Credit Factors</h3>
            <CreditFactors factors={factors} />
          </div>
        </div>
      </div>

      {/* Visual credit journey */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Credit Journey</h3>
        <div className="h-[40px] relative w-full bg-muted/20 rounded-lg overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-full flex items-center px-4">
            <div
              className="absolute h-2 rounded-full"
              style={{
                left: "5%",
                width: `${scorePosition - 5}%`,
                backgroundColor: color,
              }}
            />
            <div
              className="absolute size-4 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${scorePosition}%`,
                transform: "translateX(-50%)",
                backgroundColor: color,
              }}
            />

            {/* Score markers */}
            <div className="absolute text-xs text-muted-foreground -bottom-6 left-0">
              300
            </div>
            <div className="absolute text-xs text-muted-foreground -bottom-6 left-1/4">
              450
            </div>
            <div className="absolute text-xs text-muted-foreground -bottom-6 left-2/4 transform -translate-x-1/2">
              600
            </div>
            <div className="absolute text-xs text-muted-foreground -bottom-6 left-3/4">
              750
            </div>
            <div className="absolute text-xs text-muted-foreground -bottom-6 right-0">
              850
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
