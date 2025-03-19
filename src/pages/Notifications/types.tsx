export enum NotificationType {
  APPOINTMENT_SCHEDULED = "appointment_scheduled",
  APPOINTMENT_CONFIRMED = "appointment_confirmed",
  APPOINTMENT_CANCELLED = "appointment_cancelled",
  APPOINTMENT_RESCHEDULED = "appointment_rescheduled",
  DOCUMENT_VERIFIED = "document_verified",
  DOCUMENT_REJECTED = "document_rejected",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_DUE = "payment_due",
  REPORT_READY = "report_ready",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface Notification {
  id: string;
  type: NotificationType | string; // Using enum but keeping string for backward compatibility
  title: string;
  message: string;
  data: Record<string, string>;
  read: boolean;
  created_at: string;
  priority?: NotificationPriority; // Optional priority field
}

// Helper function to determine notification priority based on type
export function getNotificationPriority(type: string): NotificationPriority {
  if (
    type === NotificationType.PAYMENT_DUE ||
    type === NotificationType.DOCUMENT_REJECTED ||
    type === NotificationType.APPOINTMENT_CANCELLED
  ) {
    return NotificationPriority.HIGH;
  } else if (
    type === NotificationType.APPOINTMENT_SCHEDULED ||
    type === NotificationType.REPORT_READY
  ) {
    return NotificationPriority.MEDIUM;
  }
  return NotificationPriority.LOW;
}
