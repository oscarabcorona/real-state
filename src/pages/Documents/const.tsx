import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Shield,
  UserCircle,
  File,
} from "lucide-react";
import type { DocumentRequirement, Country } from "./types";

const createDocumentRequirements = (
  country: Country
): DocumentRequirement[] => {
  const baseRequirements: DocumentRequirement[] = [
    {
      type: "id_document",
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
    {
      type: "income_verification",
      label:
        country === "GUATEMALA"
          ? "Verificación de Ingresos"
          : "Income Verification",
      description:
        country === "GUATEMALA"
          ? "Últimos 3 estados de cuenta bancarios, Carta de trabajo con salario y antigüedad"
          : "Proof of income and employment",
      required: true,
      icon: <DollarSign className="h-5 w-5" />,
      country,
    },
  ];

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

  // Add the "other" document type
  baseRequirements.push({
    type: "other",
    label: country === "GUATEMALA" ? "Otros Documentos" : "Other Documents",
    description:
      country === "GUATEMALA"
        ? "Documentos adicionales de respaldo"
        : "Additional supporting documents",
    required: false,
    icon: <File className="h-5 w-5" />,
    country,
  });

  return baseRequirements;
};

export const getDocumentRequirements = (
  country: Country
): DocumentRequirement[] => {
  return createDocumentRequirements(country);
};

// Default to USA requirements for backward compatibility
export const DOCUMENT_REQUIREMENTS = createDocumentRequirements("USA");
