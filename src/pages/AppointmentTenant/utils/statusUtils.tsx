import { CheckCircle, Clock, XCircle } from "lucide-react";
import { AppointmentStatus } from "../types";

export const getStatusIcon = (status: AppointmentStatus | null) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

export const getStatusClass = (status: AppointmentStatus | null) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

export const getStatusText = (status: AppointmentStatus | null) => {
  // Handle null or undefined status
  const statusText = status || "pending";
  return statusText.charAt(0).toUpperCase() + statusText.slice(1);
};
