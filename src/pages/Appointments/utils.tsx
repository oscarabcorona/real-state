import { CheckCircle, Clock, XCircle } from "lucide-react";

/**
 * Get CSS class for appointment status
 */
export function getStatusClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "pending":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

/**
 * Get status icon based on appointment status
 */
export function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    case "pending":
    default:
      return <Clock className="h-4 w-4" />;
  }
}

/**
 * Get status text based on appointment status
 */
export function getStatusText(status: string): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "cancelled":
      return "Cancelled";
    case "pending":
    default:
      return "Pending";
  }
}
