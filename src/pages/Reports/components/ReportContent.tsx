import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Report } from "@/pages/Reports/types";
import { Download, FileText } from "lucide-react";
import { Summary } from "./modal/Summary";
import { CreditReport } from "./modal/CreditReport";
import { getRecommendationColor } from "../utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ReportContentProps {
  report: Report;
  onDownload: (report: Report) => void;
  context?: "page" | "modal";
}

export function ReportContent({
  report,
  onDownload,
  context = "page",
}: ReportContentProps) {
  // Calculate debt-to-income ratio category
  const getDtiCategory = (dti: number) => {
    if (dti <= 0.28) return { label: "Excellent", color: "text-green-600" };
    if (dti <= 0.36) return { label: "Good", color: "text-blue-600" };
    if (dti <= 0.43) return { label: "Fair", color: "text-yellow-600" };
    return { label: "High", color: "text-red-600" };
  };

  const dtiCategory = getDtiCategory(report.debt_to_income_ratio);

  return (
    <>
      {/* Recommendation banner */}
      <div
        className={`px-4 py-2 rounded-md mt-2 ${
          report.recommendation === "approved"
            ? "bg-green-50 border border-green-200"
            : report.recommendation === "denied"
            ? "bg-red-50 border border-red-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(
                report.recommendation
              )}`}
            >
              {report.recommendation.toUpperCase()}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              {report.recommendation === "approved"
                ? "This tenant meets all screening criteria"
                : report.recommendation === "denied"
                ? "This tenant does not meet required criteria"
                : "Additional review recommended"}
            </span>
          </div>

          <Button
            onClick={() => onDownload(report)}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Main content with tabs */}
      <Tabs
        defaultValue="overview"
        className={`${context === "modal" ? "mt-6" : "mt-4"} w-full`}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Improved grid with better balanced columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary section with improved card structure */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Applicant Overview</h3>
              <Summary report={report} />

              {/* Key metrics in a balanced 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* DTI Ratio Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-muted-foreground mb-1">
                        DTI Ratio
                      </span>
                      <span className="text-2xl font-bold">
                        {(report.debt_to_income_ratio * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`text-xs mt-1 ${
                          report.debt_to_income_ratio <= 0.36
                            ? "text-green-500"
                            : "text-amber-500"
                        }`}
                      >
                        {report.debt_to_income_ratio <= 0.28
                          ? "Excellent"
                          : report.debt_to_income_ratio <= 0.36
                          ? "Good"
                          : "High"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-muted-foreground mb-1">
                        Status
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getRecommendationColor(
                          report.recommendation
                        )}`}
                      >
                        {report.recommendation.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Credit Analysis with improved structure */}
            <div>
              <h3 className="text-lg font-medium mb-2">Credit Analysis</h3>
              <Card className="overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-medium">Credit Score</div>
                    <span className="text-sm font-normal text-slate-300">
                      Updated {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 bg-white">
                  <CreditReport report={report} variant="compact" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key findings section with improved grid */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Key Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.analysis.credit.factors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm">{factor}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional important information section */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Background Check</span>
                  <span
                    className={`text-sm ${
                      report.criminal_records || report.eviction_history
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {report.criminal_records || report.eviction_history
                      ? "Issues Found"
                      : "No Issues Found"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Employment</span>
                  <span
                    className={`text-sm ${
                      report.employment_verified
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {report.employment_verified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          {/* Credit Analysis Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="font-bold text-primary">1</span>
              </div>
              Credit Analysis
            </h2>

            <Card className="p-6">
              <CreditReport report={report} variant="expanded" />
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Income Analysis Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="font-bold text-primary">2</span>
              </div>
              Income Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Income Overview */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Income Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Annual Income
                      </div>
                      <div className="text-2xl font-bold">
                        ${report.analysis.income.annual.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Monthly Income
                      </div>
                      <div className="text-xl font-bold">
                        ${report.analysis.income.monthly.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Employment</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Length
                      </div>
                      <div className="text-sm font-medium">
                        {report.analysis.income.employment_length}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Verified
                      </div>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.employment_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.employment_verified ? "YES" : "NO"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Stability
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {report.analysis.income.stability.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Debt-to-Income */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Debt-to-Income</h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Debt-to-income ratio measures the percentage of income
                          that goes to paying debts. Lower is better.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center justify-center mb-3">
                    <div className="relative h-32 w-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl font-bold">
                          {(report.debt_to_income_ratio * 100).toFixed(1)}%
                        </div>
                      </div>
                      <svg
                        className="h-32 w-32 transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={
                            report.debt_to_income_ratio <= 0.28
                              ? "#10b981"
                              : report.debt_to_income_ratio <= 0.36
                              ? "#3b82f6"
                              : report.debt_to_income_ratio <= 0.43
                              ? "#eab308"
                              : "#ef4444"
                          }
                          strokeWidth="10"
                          strokeDasharray={`${
                            report.debt_to_income_ratio * 280
                          } 999`}
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`font-medium ${dtiCategory.color}`}>
                      {dtiCategory.label}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.debt_to_income_ratio <= 0.28
                        ? "Well within acceptable limits"
                        : report.debt_to_income_ratio <= 0.36
                        ? "Within acceptable limits"
                        : report.debt_to_income_ratio <= 0.43
                        ? "At the upper limit of acceptable range"
                        : "Above recommended limits"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Background Check */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <span className="font-bold text-primary">3</span>
              </div>
              Background Check
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Criminal & Eviction Records
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg ${
                        report.criminal_records
                          ? "bg-red-50 border border-red-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        Criminal Records
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          report.criminal_records
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {report.criminal_records ? "Records Found" : "Clear"}
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${
                        report.eviction_history
                          ? "bg-red-50 border border-red-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        Eviction History
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          report.eviction_history
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {report.eviction_history ? "Records Found" : "Clear"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {!report.criminal_records && !report.eviction_history
                        ? "No criminal records or eviction history were found in our database search."
                        : "Please review the document tab for more detailed information about records found."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                  <ul className="space-y-3">
                    {report.analysis.background.recommendations.map(
                      (rec, index) => (
                        <li
                          key={index}
                          className="bg-muted/40 p-3 rounded-md flex items-start"
                        >
                          <div className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2 mt-0.5">
                            ✓
                          </div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Final Recommendation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on all analyzed factors
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-md ${
                  report.recommendation === "approved"
                    ? "bg-green-50 border border-green-200"
                    : report.recommendation === "denied"
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <span
                  className={`font-medium ${
                    report.recommendation === "approved"
                      ? "text-green-800"
                      : report.recommendation === "denied"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {report.recommendation.toUpperCase()}
                </span>
              </div>
            </div>

            <Button
              onClick={() => onDownload(report)}
              variant="outline"
              className="mt-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="py-8 text-center">
            {report.documents && report.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document list would go here */}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm">
                      Document information would be displayed here
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p>No documents available for this report</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
