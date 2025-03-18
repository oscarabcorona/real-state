import { Document } from "../../types/dashboard.types";

export interface Report {
  id: string;
  user_id: string;
  created_at: string;
  status: "pending" | "completed" | "failed";
  credit_score?: number;
  income?: number;
  debt_to_income_ratio?: number;
  monthly_income?: number;
  employment_verified?: boolean;
  criminal_records?: boolean;
  eviction_history?: boolean;
  recommendation: "approved" | "denied" | "review";
  documents: Document[];
  analysis: {
    credit: {
      score: number;
      rating: "excellent" | "good" | "fair" | "poor";
      factors: string[];
    };
    income: {
      monthly: number;
      annual: number;
      stability: "high" | "medium" | "low";
      employment_length: string;
    };
    background: {
      criminal_records: boolean;
      eviction_history: boolean;
      recommendations: string[];
    };
  };
}
