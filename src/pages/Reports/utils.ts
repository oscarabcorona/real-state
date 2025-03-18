// Use absolute import path
import type { Report } from "@/pages/Reports/types";

export const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "denied":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 740) return "text-green-600";
  if (score >= 670) return "text-blue-600";
  if (score >= 580) return "text-yellow-600";
  return "text-red-600";
};

export const generateReportHTML = (report: Report) => {
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tenant Screening Report</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 2rem;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .section {
            margin-bottom: 2rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
          }
          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #111827;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .score {
            font-size: 2rem;
            font-weight: bold;
            color: ${
              (report.credit_score ?? 0) >= 740
                ? "#059669"
                : (report.credit_score ?? 0) >= 670
                ? "#2563eb"
                : (report.credit_score ?? 0) >= 580
                ? "#d97706"
                : "#dc2626"
            };
          }
          .recommendation {
            margin-top: 2rem;
            padding: 1rem;
            background-color: ${
              report.recommendation === "approved"
                ? "#f0fdf4"
                : report.recommendation === "denied"
                ? "#fef2f2"
                : "#fefce8"
            };
            border-radius: 0.5rem;
          }
          .status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-weight: 500;
            background-color: ${
              report.recommendation === "approved"
                ? "#dcfce7"
                : report.recommendation === "denied"
                ? "#fee2e2"
                : "#fef9c3"
            };
            color: ${
              report.recommendation === "approved"
                ? "#166534"
                : report.recommendation === "denied"
                ? "#991b1b"
                : "#854d0e"
            };
          }
          .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.875rem;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tenant Screening Report</h1>
            <p>Generated on ${new Date(report.created_at).toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Credit Analysis</h2>
            <div class="grid">
              <div>
                <p>Credit Score</p>
                <div class="score">${report.analysis.credit.score}</div>
                <p>Rating: ${report.analysis.credit.rating.toUpperCase()}</p>
              </div>
              <div>
                <p>Key Factors:</p>
                <ul>
                  ${report.analysis.credit.factors
                    .map((factor) => `<li>${factor}</li>`)
                    .join("")}
                </ul>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Income Verification</h2>
            <div class="grid">
              <div>
                <p>Annual Income: $${report.analysis.income.annual.toLocaleString()}</p>
                <p>Monthly Income: $${report.analysis.income.monthly.toLocaleString()}</p>
              </div>
              <div>
                <p>Employment Length: ${report.analysis.income.employment_length}</p>
                <p>Income Stability: ${report.analysis.income.stability.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Background Check</h2>
            <div class="grid">
              <div>
                <p>Criminal Records: ${
                  report.analysis.background.criminal_records
                    ? "Found"
                    : "None Found"
                }</p>
                <p>Eviction History: ${
                  report.analysis.background.eviction_history
                    ? "Found"
                    : "None Found"
                }</p>
              </div>
              <div>
                <p>Recommendations:</p>
                <ul>
                  ${report.analysis.background.recommendations
                    .map((rec) => `<li>${rec}</li>`)
                    .join("")}
                </ul>
              </div>
            </div>
          </div>

          <div class="recommendation">
            <h2 class="section-title">Final Recommendation</h2>
            <div class="status">${report.recommendation.toUpperCase()}</div>
          </div>

          <div class="footer">
            <p>This report was generated by ShortStay Compliance Hub</p>
            <p>Report ID: ${report.id}</p>
          </div>
        </div>
      </body>
      </html>
    `;

  return html;
};

export const downloadReport = (report: Report) => {
  const html = generateReportHTML(report);
  const blob = new Blob([html], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tenant-screening-report-${
    new Date().toISOString().split("T")[0]
  }.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
