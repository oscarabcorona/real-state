import { CheckCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Fix the import path to use the absolute path
import type { ReportCreditAnalysis } from "@/pages/Reports/types";

interface CreditScoreSectionProps {
  creditAnalysis: ReportCreditAnalysis;
}

// Helper function
const getScoreColor = (score: number) => {
  if (score >= 740) return "text-green-600";
  if (score >= 670) return "text-blue-600";
  if (score >= 580) return "text-yellow-600";
  return "text-red-600";
};

export function CreditScoreSection({
  creditAnalysis,
}: CreditScoreSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
          <CardTitle className="text-lg">Credit Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div
            className={`text-4xl font-bold ${getScoreColor(
              creditAnalysis.score
            )}`}
          >
            {creditAnalysis.score}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Credit Score</div>
        </div>
        <div className="space-y-2">
          {creditAnalysis.factors.map((factor, index) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              {factor}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
