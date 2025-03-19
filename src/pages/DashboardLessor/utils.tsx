import { CheckCircle, Clock, XCircle } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <div className="p-1.5 bg-green-100 rounded-full">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      );
    case "failed":
      return (
        <div className="p-1.5 bg-red-100 rounded-full">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
      );
    default:
      return (
        <div className="p-1.5 bg-amber-100 rounded-full">
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
      );
  }
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border border-green-200";
    case "failed":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border border-amber-200";
  }
};
