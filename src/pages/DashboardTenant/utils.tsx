import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
    case "signed":
    case "confirmed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case "completed":
    case "signed":
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-red-100 text-red-800";
  }
};
