import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Banknote,
  DollarSign,
} from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

export const getStatusBadgeVariant = (
  status: string
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatPaymentMethod = (method: string): string => {
  return method.replace("_", " ").toUpperCase();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case "credit_card":
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    case "ach":
      return <Banknote className="h-4 w-4 text-muted-foreground" />;
    case "cash":
      return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    default:
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  }
};
