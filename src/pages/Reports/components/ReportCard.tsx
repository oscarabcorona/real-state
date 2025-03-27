import {
  Building2,
  CreditCard,
  DollarSign,
  Eye,
  Shield,
  Calendar,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Report } from "@/pages/Reports/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
  report: Report;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        hover: "hover:bg-green-100",
      };
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        hover: "hover:bg-yellow-100",
      };
    case "failed":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        hover: "hover:bg-red-100",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        hover: "hover:bg-gray-100",
      };
  }
};

const getRecommendationConfig = (recommendation: string) => {
  switch (recommendation) {
    case "approved":
      return {
        bg: "bg-[#EEF4FF]",
        text: "text-[#0F3CD9]",
        hover: "hover:bg-[#EEF4FF]",
      };
    case "denied":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        hover: "hover:bg-red-100",
      };
    case "review":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        hover: "hover:bg-yellow-100",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        hover: "hover:bg-gray-100",
      };
  }
};

const getCreditScoreConfig = (score: number) => {
  if (score >= 740) return { color: "text-green-600", label: "EXCELLENT" };
  if (score >= 670) return { color: "text-[#0F3CD9]", label: "GOOD" };
  if (score >= 580) return { color: "text-yellow-600", label: "FAIR" };
  return { color: "text-red-600", label: "POOR" };
};

export function ReportCard({ report }: ReportCardProps) {
  const statusConfig = getStatusConfig(report.status);
  const recommendationConfig = getRecommendationConfig(report.recommendation);
  const creditScoreConfig = getCreditScoreConfig(report.credit_score || 0);

  return (
    <div className="p-6 hover:bg-gray-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-[#0F3CD9] border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-[#EEF4FF] rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-[#0F3CD9]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-medium">Report #{report.id}</h3>
              <Badge
                variant="secondary"
                className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.hover}`}
              >
                {report.status.toUpperCase()}
              </Badge>
              <Badge
                variant="secondary"
                className={`${recommendationConfig.bg} ${recommendationConfig.text} ${recommendationConfig.hover}`}
              >
                {report.recommendation.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Generated on {new Date(report.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {new Date(report.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to={`/dashboard/reports/${report.id}`}>
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6 bg-gray-50/50 rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-[#EEF4FF] rounded-lg flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-[#0F3CD9]" />
          </div>
          <div>
            <div className="text-sm font-medium">Credit Score</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`${creditScoreConfig.color} text-xl font-semibold`}
              >
                {report.credit_score}
              </span>
              <Badge
                variant="secondary"
                className={`${creditScoreConfig.color} bg-white font-medium border border-gray-100`}
              >
                {creditScoreConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
          <div className="h-10 w-10 bg-[#EEF4FF] rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-[#0F3CD9]" />
          </div>
          <div>
            <div className="text-sm font-medium">Monthly Income</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-semibold">
                ${report.monthly_income?.toLocaleString()}
              </span>
              <Badge
                variant="secondary"
                className="bg-white font-medium border border-gray-100"
              >
                {report.analysis.income.stability.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
          <div className="h-10 w-10 bg-[#EEF4FF] rounded-lg flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-[#0F3CD9]" />
          </div>
          <div>
            <div className="text-sm font-medium">Background Check</div>
            <div className="flex items-center gap-2 mt-1">
              {report.eviction_history ? (
                <span className="text-yellow-600 text-xl font-semibold">
                  Review
                </span>
              ) : (
                <span className="text-green-600 text-xl font-semibold">
                  Clear
                </span>
              )}
              <Badge
                variant="secondary"
                className="bg-white font-medium border border-gray-100"
              >
                {report.analysis.background.recommendations.length} ISSUES
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
