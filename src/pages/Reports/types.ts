import { Document } from "@/types/dashboard.types";

export interface ReportCreditAnalysis {
  score: number;
  rating: string;
  factors: string[];
}

export interface ReportIncomeAnalysis {
  monthly: number;
  annual: number;
  stability: string;
  employment_length: string;
}

export interface ReportBackgroundAnalysis {
  criminal_records: boolean;
  eviction_history: boolean;
  recommendations: string[];
}

export interface ReportAnalysis {
  credit: ReportCreditAnalysis;
  income: ReportIncomeAnalysis;
  background: ReportBackgroundAnalysis;
}

export type ReportStatus = "completed" | "pending" | "failed";

export interface Report {
  id: string;
  user_id: string;
  created_at: string;
  status: ReportStatus; // Using the union type instead of string
  credit_score: number; // Making sure this is required, not optional
  income: number;
  debt_to_income_ratio: number;
  monthly_income: number;
  employment_verified: boolean;
  criminal_records: boolean;
  eviction_history: boolean;
  recommendation: string;
  documents: Document[];
  analysis: ReportAnalysis;
}
