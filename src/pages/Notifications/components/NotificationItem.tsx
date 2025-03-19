import { format } from "date-fns";
import { X } from "lucide-react";
import { Notification } from "../types";
import { NotificationIcon } from "./NotificationIcon";
import { getNotificationLink } from "../utils/notificationHelpers";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <div className={`p-6 ${!notification.read ? "bg-indigo-50" : ""}`}>
      <div className="flex items-start">
        <NotificationIcon type={notification.type} />
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <div className="ml-4 flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {format(new Date(notification.created_at), "MMM d, h:mm a")}
              </span>
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
          <div className="mt-2">
            <a
              href={getNotificationLink(notification)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              View details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
