import { Notification } from "../types";
import { EmptyState } from "./EmptyState";
import { NotificationItem } from "./NotificationItem";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { groupNotificationsByDate } from "../utils/notificationHelpers";
import { AnimatedElement } from "@/components/animated/AnimatedElement";

type NotificationsListProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  className?: string;
  loading?: boolean;
  grouped?: boolean;
};

export function NotificationsList({
  notifications,
  onMarkAsRead,
  className,
  loading = false,
  grouped = true,
}: NotificationsListProps) {
  if (loading) {
    return (
      <Card className={cn("p-1", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse p-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-[60%] rounded" />
                <div className="bg-muted h-3 w-[90%] rounded" />
                <div className="bg-muted h-3 w-[40%] rounded" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <EmptyState />
      </Card>
    );
  }

  if (!grouped) {
    return (
      <Card className={cn("p-1", className)}>
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[500px]">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
              {index < notifications.length - 1 && (
                <Separator className="mx-4" />
              )}
            </div>
          ))}
        </ScrollArea>
      </Card>
    );
  }

  // Grouped notifications
  const groups = groupNotificationsByDate(notifications);

  return (
    <Card className={cn("p-1", className)}>
      <ScrollArea className="h-[calc(100vh-12rem)] md:h-[500px]">
        {groups.map((group, groupIndex) => (
          <AnimatedElement
            key={group.label}
            animation="fadeIn"
            delay={0.1 * groupIndex}
          >
            <div className="sticky top-0 bg-background p-2 z-10">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                {group.label}
              </h3>
            </div>
            {group.notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
                {index < group.notifications.length - 1 && (
                  <Separator className="mx-4" />
                )}
              </div>
            ))}
            {groupIndex < groups.length - 1 && <Separator className="my-1" />}
          </AnimatedElement>
        ))}
      </ScrollArea>
    </Card>
  );
}
