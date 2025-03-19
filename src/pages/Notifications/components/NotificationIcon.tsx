import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
} from "lucide-react";

type NotificationIconProps = {
  type: string;
};

export function NotificationIcon({ type }: NotificationIconProps) {
  switch (type) {
    case "appointment_scheduled":
    case "appointment_confirmed":
    case "appointment_cancelled":
    case "appointment_rescheduled":
      return <Calendar className="h-6 w-6 text-indigo-500" />;
    case "document_verified":
    case "document_rejected":
      return <FileText className="h-6 w-6 text-blue-500" />;
    case "payment_received":
    case "payment_due":
      return <CreditCard className="h-6 w-6 text-green-500" />;
    case "report_ready":
      return <CheckCircle className="h-6 w-6 text-purple-500" />;
    default:
      return <Bell className="h-6 w-6 text-gray-400" />;
  }
}
