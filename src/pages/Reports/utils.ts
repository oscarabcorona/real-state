// Use absolute import path
import type { Report } from "@/pages/Reports/types";
import { composeReport } from "@/pages/Reports/reportTemplate";

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
  // Split HTML by composing parts from reportTemplate.ts
  const html = composeReport(report);
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
