import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Shield,
  UserCircle,
  FileText,
  File,
} from "lucide-react";
import type { DocumentRequirement } from "./types";

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: "id_document",
    label: "Government ID",
    description:
      "Valid government-issued photo ID (driver's license, passport, etc.)",
    required: true,
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    type: "credit_report",
    label: "Credit Report",
    description: "TransUnion credit report with ResidentScore",
    required: true,
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    type: "criminal_report",
    label: "Criminal Background Check",
    description: "National criminal background verification",
    required: true,
    icon: <Shield className="h-5 w-5" />,
  },
  {
    type: "eviction_report",
    label: "Eviction History",
    description: "Nationwide eviction history report",
    required: true,
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    type: "income_verification",
    label: "Income Verification",
    description: "Proof of income and employment",
    required: true,
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    type: "other",
    label: "Other Documents",
    description: "Additional supporting documents",
    required: false,
    icon: <File className="h-5 w-5" />,
  },
];
