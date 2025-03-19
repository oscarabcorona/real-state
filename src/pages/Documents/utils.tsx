import { AlertCircle, Check, CheckCircle, Clock } from "lucide-react";

export const getStatusIcon = (status: string, verified: boolean) => {
  if (verified) return <CheckCircle className="h-5 w-5 text-green-500" />;

  switch (status) {
    case "signed":
      return <Check className="h-5 w-5 text-green-500" />;
    case "rejected":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

export const getStatusClass = (status: string, verified: boolean) => {
  if (verified)
    return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400";

  switch (status) {
    case "signed":
      return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
  }
};

export const getStatusText = (status: string, verified: boolean) => {
  if (verified) return "Verified";
  return status.charAt(0).toUpperCase() + status.slice(1);
};
