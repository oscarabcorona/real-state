import { Notification } from "../types";
import { format } from "date-fns";
import { Bell, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
  grouped?: boolean;
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  loading = false,
  grouped = false,
}: NotificationsListProps) {
  if (loading) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[300px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No notifications to display
      </div>
    );
  }

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey = format(date, "MMM d, yyyy");
      if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
        groupKey = "Today";
      } else if (
        format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
      ) {
        groupKey = "Yesterday";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    return groups;
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes("cancelled")) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (type.includes("confirmed")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (type.includes("scheduled") || type.includes("rescheduled")) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  const getNotificationBadge = (type: string) => {
    if (type.includes("cancelled")) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Important
        </Badge>
      );
    }
    return null;
  };

  const renderNotification = (notification: Notification, isLast: boolean) => (
    <div
      key={notification.id}
      className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
        !notification.read ? "bg-muted/10" : ""
      } ${!isLast ? "border-b" : ""}`}
    >
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{notification.title}</span>
          {getNotificationBadge(notification.type)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {notification.message}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{format(new Date(notification.created_at), "h:mm a")}</span>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs hover:bg-transparent hover:text-primary"
              onClick={() => onMarkAsRead(notification.id)}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (!grouped) {
    return (
      <div>
        {notifications.map((notification, index) =>
          renderNotification(notification, index === notifications.length - 1)
        )}
      </div>
    );
  }

  const groups = groupNotificationsByDate(notifications);
  return (
    <div>
      {Object.entries(groups).map(([date, groupNotifications], groupIndex) => (
        <div key={date}>
          <div className="px-4 py-2 bg-muted/5 border-b">
            <h3 className="text-sm font-medium">{date}</h3>
          </div>
          <div>
            {groupNotifications.map((notification, index) =>
              renderNotification(
                notification,
                index === groupNotifications.length - 1 &&
                  groupIndex === Object.entries(groups).length - 1
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
