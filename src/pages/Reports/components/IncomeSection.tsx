import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Fix the import path to use the absolute path
import type { ReportIncomeAnalysis } from "@/pages/Reports/types";

interface IncomeSectionProps {
  incomeAnalysis: ReportIncomeAnalysis;
}

export function IncomeSection({ incomeAnalysis }: IncomeSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
          <CardTitle className="text-lg">Income Verification</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Annual Income</div>
          <div className="text-xl font-bold">
            ${incomeAnalysis.annual.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Monthly Income</div>
          <div className="text-xl font-bold">
            ${incomeAnalysis.monthly.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Employment Length</div>
          <div className="text-xl font-bold">
            {incomeAnalysis.employment_length}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Income Stability</div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {incomeAnalysis.stability.toUpperCase()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
