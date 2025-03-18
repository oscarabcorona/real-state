import { Button } from "@/components/ui/button";
import type { Report } from "@/pages/Reports/types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { downloadReport } from "./utils";
import { ReportContent } from "./components/ReportContent";

export function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we're using mock data
    // In a real application, you'd fetch the report using the ID from the API
    const fetchReport = async () => {
      try {
        // Mock data for demonstration purposes
        const mockReport: Report = {
          id: id || "1",
          user_id: "user123",
          created_at: new Date().toISOString(),
          status: "completed",
          credit_score: 720,
          income: 75000,
          debt_to_income_ratio: 0.28,
          monthly_income: 6250,
          employment_verified: true,
          criminal_records: false,
          eviction_history: false,
          recommendation: "approved",
          documents: [],
          analysis: {
            credit: {
              score: 720,
              rating: "good",
              factors: [
                "Long credit history",
                "Low credit utilization",
                "No late payments",
                "Mix of credit types",
              ],
            },
            income: {
              monthly: 6250,
              annual: 75000,
              stability: "high",
              employment_length: "3 years",
            },
            background: {
              criminal_records: false,
              eviction_history: false,
              recommendations: [
                "Clean background check",
                "No eviction history",
                "Stable employment history",
              ],
            },
          },
        };

        setReport(mockReport);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Report not found</p>
        <Button onClick={() => navigate("/dashboard/reports")} className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/reports")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tenant Screening Report</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Use the shared ReportContent component */}
      <ReportContent
        report={report}
        onDownload={downloadReport}
        context="page"
      />
    </div>
  );
}
