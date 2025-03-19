import { Notification } from "../types";

export function getNotificationLink(notification: Notification): string {
  switch (notification.type) {
    case "appointment_scheduled":
    case "appointment_confirmed":
    case "appointment_cancelled":
    case "appointment_rescheduled":
      return `/dashboard/appointments`;
    case "document_verified":
    case "document_rejected":
      return `/dashboard/documents`;
    case "payment_received":
    case "payment_due":
      return `/dashboard/payments`;
    case "report_ready":
      return `/dashboard/reports`;
    default:
      return "#";
  }
}
