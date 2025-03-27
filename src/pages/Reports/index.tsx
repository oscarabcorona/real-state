import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import type { Report } from "@/pages/Reports/types";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCard } from "./components/ReportCard";
import { EmptyState } from "./components/EmptyState";
import { Button } from "@/components/ui/button";
import { Filter, Plus, FileText, Check, Clock, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportSkeleton } from "./components/ReportSkeleton";
import { Badge } from "@/components/ui/badge";

export function Reports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (user) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReports = async () => {
    try {
      const mockReports: Report[] = [
        {
          id: "1",
          user_id: user?.id || "",
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
        },
        {
          id: "2",
          user_id: user?.id || "",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          status: "pending",
          credit_score: 650,
          income: 55000,
          debt_to_income_ratio: 0.35,
          monthly_income: 4583,
          employment_verified: true,
          criminal_records: false,
          eviction_history: true,
          recommendation: "review",
          documents: [],
          analysis: {
            credit: {
              score: 650,
              rating: "fair",
              factors: [
                "Recent credit inquiries",
                "High credit utilization",
                "Limited credit history",
              ],
            },
            income: {
              monthly: 4583,
              annual: 55000,
              stability: "medium",
              employment_length: "1 year",
            },
            background: {
              criminal_records: false,
              eviction_history: true,
              recommendations: [
                "Previous eviction requires review",
                "Verify current employment status",
                "Request additional references",
              ],
            },
          },
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === "oldest") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    return 0;
  });

  const stats = {
    total: reports.length,
    approved: reports.filter((r) => r.recommendation === "approved").length,
    pending: reports.filter((r) => r.status === "pending").length,
    averageScore: Math.round(
      reports.reduce((acc, r) => acc + (r.credit_score || 0), 0) /
        reports.length || 0
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tenant Screening Reports</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your tenant screening reports
          </p>
        </div>
        <Button className="bg-[#0F3CD9] hover:bg-[#0F3CD9]/90">
          <Plus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Reports
                </p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#0F3CD9]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Credit Score
                </p>
                <p className="text-2xl font-semibold text-blue-600">
                  {stats.averageScore}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">All Reports</h2>
              <Badge
                variant="secondary"
                className="bg-[#EEF4FF] text-[#0F3CD9] font-medium"
              >
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "Report" : "Reports"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-sm bg-gray-50 border-gray-200">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-9 text-sm bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div>
              <ReportSkeleton />
              <ReportSkeleton />
              <ReportSkeleton />
            </div>
          ) : reports.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {sortedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
