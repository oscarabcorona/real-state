import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
// Use an absolute import path consistently
import type { Report } from "@/pages/Reports/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCard } from "./components/ReportCard";
import { EmptyState } from "./components/EmptyState";

export function Reports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReports = async () => {
    try {
      // For now, we'll use mock data for user 1@gmail.com
      const mockReport: Report = {
        id: "1",
        user_id: user?.id || "",
        created_at: new Date().toISOString(),
        status: "completed", // Using the proper status value from the union type
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

      setReports([mockReport]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Tenant Screening Reports</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {reports.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
