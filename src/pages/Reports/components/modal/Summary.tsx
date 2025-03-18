import { Card, CardContent } from "@/components/ui/card";
import { FileText, Check, AlertCircle, Clock } from "lucide-react";
import type { Report } from "@/pages/Reports/types";
import { getScoreColor } from "@/pages/Reports/utils";

export function Summary({ report }: { report: Report }) {
  const getStatusIcon = (value: boolean, checkPositive = true) => {
    if ((checkPositive && value) || (!checkPositive && !value)) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-0">
        <div className="bg-slate-50 p-3 border-b">
          <h3 className="text-sm font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            Applicant Overview
          </h3>
        </div>

        <div className="divide-y">
          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">Credit Score</span>
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${getScoreColor(report.credit_score)}`}
              >
                {report.credit_score}
              </span>
              {report.credit_score >= 670 ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : report.credit_score >= 580 ? (
                <Clock className="h-4 w-4 text-amber-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">
              Monthly Income
            </span>
            <span className="font-medium">
              ${report.monthly_income.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">
              Criminal Records
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`font-medium ${
                  report.criminal_records ? "text-red-600" : "text-green-600"
                }`}
              >
                {report.criminal_records ? "Yes" : "No"}
              </span>
              {getStatusIcon(report.criminal_records, false)}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">
              Eviction History
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`font-medium ${
                  report.eviction_history ? "text-red-600" : "text-green-600"
                }`}
              >
                {report.eviction_history ? "Yes" : "No"}
              </span>
              {getStatusIcon(report.eviction_history, false)}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">
              Employment Verified
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`font-medium ${
                  report.employment_verified
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {report.employment_verified ? "Yes" : "No"}
              </span>
              {getStatusIcon(report.employment_verified)}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 hover:bg-muted/10 transition-colors">
            <span className="text-sm text-muted-foreground">
              Debt-to-Income
            </span>
            <span
              className={`font-medium ${
                report.debt_to_income_ratio <= 0.36
                  ? "text-green-600"
                  : report.debt_to_income_ratio <= 0.43
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {(report.debt_to_income_ratio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
