import type { Report } from "@/pages/Reports/types";
import { CreditScoreChart } from "./credit-report/CreditScoreChart";
import { CreditCategories } from "./credit-report/CreditCategories";
import { CreditStats } from "./credit-report/CreditStats";
import { CreditFactors } from "./credit-report/CreditFactors";

export function CreditReport({ report }: { report: Report }) {
  const getCreditScoreCategory = (score: number) => {
    if (score >= 750)
      return { category: "Excellent", color: "hsl(var(--chart-1))" };
    if (score >= 670) return { category: "Good", color: "hsl(var(--chart-2))" };
    if (score >= 580) return { category: "Fair", color: "hsl(var(--chart-3))" };
    return { category: "Poor", color: "hsl(var(--chart-4))" };
  };

  const { category, color } = getCreditScoreCategory(report.credit_score);
  const factors = report.analysis.credit.factors;

  return (
    // Removed redundant Card, CardHeader and nested structure
    <div className="space-y-4">
      {/* Chart and stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Chart with fixed sizing for better consistency */}
        <div className="flex justify-center">
          <div className="w-[180px] h-[180px]">
            <CreditScoreChart
              score={report.credit_score}
              category={category}
              color={color}
            />
          </div>
        </div>

        {/* Stats with more organized layout */}
        <div className="space-y-4">
          <CreditCategories currentCategory={category} />
          <CreditStats />
        </div>
      </div>

      {/* Factors with improved spacing */}
      <CreditFactors factors={factors} />
    </div>
  );
}
