import { isThisMonth, isThisWeek, isToday, isYesterday } from "date-fns";
import { Notification, NotificationType } from "../types";

export function getNotificationLink(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.APPOINTMENT_SCHEDULED:
    case NotificationType.APPOINTMENT_CONFIRMED:
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_RESCHEDULED:
      return `/dashboard/appointments`;
    case NotificationType.DOCUMENT_VERIFIED:
    case NotificationType.DOCUMENT_REJECTED:
      return `/dashboard/documents`;
    case NotificationType.PAYMENT_RECEIVED:
    case NotificationType.PAYMENT_DUE:
      return `/dashboard/payments`;
    case NotificationType.REPORT_READY:
      return `/dashboard/reports`;
    default:
      return "#";
  }
}

export type NotificationGroup = {
  label: string;
  notifications: Notification[];
};

export function groupNotificationsByDate(notifications: Notification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const thisMonth: Notification[] = [];
  const older: Notification[] = [];

  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    if (isToday(date)) {
      today.push(notification);
    } else if (isYesterday(date)) {
      yesterday.push(notification);
    } else if (isThisWeek(date)) {
      thisWeek.push(notification);
    } else if (isThisMonth(date)) {
      thisMonth.push(notification);
    } else {
      older.push(notification);
    }
  });

  if (today.length) groups.push({ label: "Today", notifications: today });
  if (yesterday.length) groups.push({ label: "Yesterday", notifications: yesterday });
  if (thisWeek.length) groups.push({ label: "This Week", notifications: thisWeek });
  if (thisMonth.length) groups.push({ label: "This Month", notifications: thisMonth });
  if (older.length) groups.push({ label: "Older", notifications: older });

  return groups;
}

export function filterNotificationsByType(
  notifications: Notification[], 
  type: string | null
): Notification[] {
  if (!type) return notifications;
  
  return notifications.filter(notification => 
    type === 'all' || notification.type.startsWith(type)
  );
}

export function filterNotificationsByReadStatus(
  notifications: Notification[],
  isRead: boolean
): Notification[] {
  return notifications.filter(notification => 
    notification.read === isRead
  );
}

export function sortNotifications(
  notifications: Notification[], 
  sortOrder: 'newest' | 'oldest' = 'newest'
): Notification[] {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
}
