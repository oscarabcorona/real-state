import { Building2, CreditCard, DollarSign, Eye, Shield } from "lucide-react";
// Use the same absolute import path as the main component
import type { Report } from "@/pages/Reports/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReportCardProps {
  report: Report;
  onViewReport: (report: Report) => void;
}

// Helper functions
const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "denied":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 740) return "text-green-600";
  if (score >= 670) return "text-blue-600";
  if (score >= 580) return "text-yellow-600";
  return "text-red-600";
};

export function ReportCard({ report, onViewReport }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <div className="ml-3">
              <h3 className="text-lg font-medium">Tenant Screening Report</h3>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationColor(
                report.recommendation
              )}`}
            >
              {report.recommendation.toUpperCase()}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onViewReport(report)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>View detailed report information</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="ml-2">
              <div className="text-sm font-medium text-muted-foreground">
                Credit Score
              </div>
              <div
                className={`text-lg font-semibold ${getScoreColor(
                  report.credit_score || 0
                )}`}
              >
                {report.credit_score}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div className="ml-2">
              <div className="text-sm font-medium text-muted-foreground">
                Monthly Income
              </div>
              <div className="text-lg font-semibold">
                ${report.monthly_income?.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div className="ml-2">
              <div className="text-sm font-medium text-muted-foreground">
                Background Check
              </div>
              <div className="text-lg font-semibold">
                {report.criminal_records ? (
                  <span className="text-destructive">Issues Found</span>
                ) : (
                  <span className="text-green-600">Clear</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
