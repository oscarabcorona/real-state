import { format } from "date-fns";
import { Check, X } from "lucide-react";
import {
  Notification,
  NotificationPriority,
  getNotificationPriority,
} from "../types";
import { NotificationIcon } from "./NotificationIcon";
import { getNotificationLink } from "../utils/notificationHelpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedElement } from "@/components/animated/AnimatedElement";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const isUnread = !notification.read;
  const priority =
    notification.priority || getNotificationPriority(notification.type);
  const isPriority = priority === NotificationPriority.HIGH;

  return (
    <AnimatedElement
      animation="slideUp"
      className={cn(
        "p-4 transition-colors relative group",
        isUnread && "bg-muted/30 hover:bg-muted/50",
        !isUnread && "hover:bg-muted/10",
        isPriority &&
          isUnread &&
          "bg-red-50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20",
        isPriority && "border-l-2 border-red-500/50"
      )}
      delay={0.1}
      duration={0.3}
    >
      {isUnread && !isPriority && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all",
            isUnread ? "bg-primary/10" : "bg-muted/20",
            isPriority && isUnread && "bg-red-100 dark:bg-red-900/20",
            "group-hover:scale-110 duration-300"
          )}
        >
          <NotificationIcon
            type={notification.type}
            animated={isUnread && isPriority}
          />
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <h4
                className={cn(
                  "text-sm leading-tight line-clamp-1",
                  isUnread
                    ? "font-semibold"
                    : "font-medium text-muted-foreground"
                )}
              >
                {isUnread ? (
                  <span className="text-primary">{notification.title}</span>
                ) : (
                  notification.title
                )}
                {isUnread && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-[10px] py-0 px-1.5 h-4"
                  >
                    New
                  </Badge>
                )}
                {isPriority && (
                  <Badge
                    variant="destructive"
                    className="ml-1 text-[10px] py-0 px-1.5 h-4"
                  >
                    Important
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
              className={cn(
                "h-8 w-8 rounded-full opacity-50 hover:opacity-100 transition-opacity shrink-0",
                "opacity-0 group-hover:opacity-60 hover:!opacity-100"
              )}
              onClick={() => onMarkAsRead(notification.id)}
            >
              {isUnread ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isUnread ? "Mark as read" : "Already read"}
              </span>
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 pt-0.5">
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
    </AnimatedElement>
  );
}
