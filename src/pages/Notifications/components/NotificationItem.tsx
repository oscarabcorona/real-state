import { format } from "date-fns";
import { X } from "lucide-react";
import { Notification } from "../types";
import { NotificationIcon } from "./NotificationIcon";
import { getNotificationLink } from "../utils/notificationHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "p-4 transition-colors",
        !notification.read && "bg-muted/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="bg-muted/20 flex h-10 w-10 items-center justify-center rounded-full">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium leading-none">
                {notification.title}
                {!notification.read && (
                  <Badge variant="secondary" className="ml-2">
                    New
                  </Badge>
                )}
              </h4>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
              <a href={getNotificationLink(notification)}>View details</a>
            </Button>
            <time
              dateTime={notification.created_at}
              className="text-muted-foreground text-xs"
            >
              {format(new Date(notification.created_at), "MMM d, h:mm a")}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
