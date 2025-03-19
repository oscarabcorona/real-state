import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType =
  | "appointment_scheduled"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "document_verified"
  | "document_rejected"
  | "payment_received"
  | "payment_due"
  | "report_ready";

type NotificationIconProps = {
  type: NotificationType | string;
  className?: string;
};

export function NotificationIcon({ type, className }: NotificationIconProps) {
  const iconClass = cn(
    "size-5 transition-all duration-200",
    {
      "text-primary": type.startsWith("appointment_"),
      "text-blue-500 dark:text-blue-400": type.startsWith("document_"),
      "text-green-500 dark:text-green-400": type.startsWith("payment_"),
      "text-purple-500 dark:text-purple-400": type === "report_ready",
      "text-muted-foreground": type === "default",
    },
    className
  );

  switch (type) {
    case "appointment_scheduled":
    case "appointment_confirmed":
    case "appointment_cancelled":
    case "appointment_rescheduled":
      return <Calendar className={iconClass} />;
    case "document_verified":
    case "document_rejected":
      return <FileText className={iconClass} />;
    case "payment_received":
    case "payment_due":
      return <CreditCard className={iconClass} />;
    case "report_ready":
      return <CheckCircle className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
}
