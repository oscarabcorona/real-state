import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Shield,
  UserCircle,
  File,
  Building2,
  Wallet,
} from "lucide-react";
import type { DocumentRequirement, Country } from "./types";

const createDocumentRequirements = (
  country: Country
): DocumentRequirement[] => {
  const baseRequirements: DocumentRequirement[] = [
    {
      type: "government_id",
      label:
        country === "GUATEMALA"
          ? "Identificación Oficial (ID)"
          : "Government ID",
      description:
        country === "GUATEMALA"
          ? "Identificación Oficial (ID)"
          : "Valid government-issued photo ID (driver's license, passport, etc.)",
      required: true,
      icon: <UserCircle className="h-5 w-5" />,
      country,
    },
    {
      type: "credit_report",
      label: country === "GUATEMALA" ? "Reporte de crédito" : "Credit Report",
      description:
        country === "GUATEMALA"
          ? "Reporte de crédito"
          : "Credit report from authorized provider",
      required: true,
      icon: <CreditCard className="h-5 w-5" />,
      country,
    },
    {
      type: "criminal_report",
      label:
        country === "GUATEMALA"
          ? "Antecedentes penales"
          : "Criminal Background Check",
      description:
        country === "GUATEMALA"
          ? "Antecedentes penales y policiacos"
          : "Criminal background verification",
      required: true,
      icon: <Shield className="h-5 w-5" />,
      country,
    },
  ];

  // Add income verification based on country
  if (country === "GUATEMALA") {
    baseRequirements.push(
      {
        type: "bank_statements",
        label: "Estados de Cuenta Bancarios",
        description: "Últimos 3 estados de cuenta bancarios",
        required: true,
        icon: <Wallet className="h-5 w-5" />,
        country,
      },
      {
        type: "employment_letter",
        label: "Carta de Trabajo",
        description: "Carta de trabajo con salario y antigüedad",
        required: true,
        icon: <Building2 className="h-5 w-5" />,
        country,
      }
    );
  } else {
    baseRequirements.push({
      type: "income_verification",
      label: "Income Verification",
      description: "Proof of income and employment",
      required: true,
      icon: <DollarSign className="h-5 w-5" />,
      country,
    });
  }

  // Add country-specific requirements
  if (country === "USA") {
    baseRequirements.push({
      type: "eviction_report",
      label: "Eviction History",
      description: "Nationwide eviction history report",
      required: true,
      icon: <AlertTriangle className="h-5 w-5" />,
      country,
    });
  }

  // Add the "other" document type only for non-Guatemala countries
  if (country !== "GUATEMALA") {
    baseRequirements.push({
      type: "other",
      label: "Other Documents",
      description: "Additional supporting documents",
      required: false,
      icon: <File className="h-5 w-5" />,
      country,
    });
  }

  return baseRequirements;
};

export const getDocumentRequirements = (
  country: Country
): DocumentRequirement[] => {
  return createDocumentRequirements(country);
};

// Default to USA requirements for backward compatibility
export const DOCUMENT_REQUIREMENTS = createDocumentRequirements("USA");
