import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NotificationType,
  NotificationPriority,
  getNotificationPriority,
} from "../types";

type NotificationIconProps = {
  type: NotificationType | string;
  className?: string;
  animated?: boolean;
};

export function NotificationIcon({
  type,
  className,
  animated = false,
}: NotificationIconProps) {
  const priority = getNotificationPriority(type);

  const iconClass = cn(
    "size-5 transition-all duration-200",
    {
      "text-blue-500 dark:text-blue-400": type.startsWith("appointment_"),
      "text-emerald-500 dark:text-emerald-400":
        type.startsWith("document_verified"),
      "text-red-500 dark:text-red-400": type.startsWith("document_rejected"),
      "text-green-500 dark:text-green-400":
        type === NotificationType.PAYMENT_RECEIVED,
      "text-amber-500 dark:text-amber-400":
        type === NotificationType.PAYMENT_DUE,
      "text-purple-500 dark:text-purple-400":
        type === NotificationType.REPORT_READY,
      "text-muted-foreground": type === "default",
      "animate-pulse": animated && priority === NotificationPriority.HIGH,
    },
    className
  );

  // Choose icon based on type
  switch (type) {
    case NotificationType.APPOINTMENT_SCHEDULED:
    case NotificationType.APPOINTMENT_CONFIRMED:
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_RESCHEDULED:
      return <Calendar className={iconClass} />;
    case NotificationType.DOCUMENT_VERIFIED:
    case NotificationType.DOCUMENT_REJECTED:
      return <FileText className={iconClass} />;
    case NotificationType.PAYMENT_RECEIVED:
    case NotificationType.PAYMENT_DUE:
      return <CreditCard className={iconClass} />;
    case NotificationType.REPORT_READY:
      return <CheckCircle className={iconClass} />;
    default:
      return priority === NotificationPriority.HIGH ? (
        <AlertTriangle className={iconClass} />
      ) : (
        <Bell className={iconClass} />
      );
  }
}
