import { Notification } from "../types";
import { EmptyState } from "./EmptyState";
import { NotificationItem } from "./NotificationItem";

type NotificationsListProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
};

export function NotificationsList({
  notifications,
  onMarkAsRead,
}: NotificationsListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))
      )}
    </div>
  );
}
