import { Notification } from "../types";
import { EmptyState } from "./EmptyState";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { groupNotificationsByDate } from "../utils/notificationHelpers";
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { NotificationSkeleton } from "./NotificationSkeleton";

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
      <div className={cn("p-0", className)}>
        <div className="pt-2">
          {[...Array(3)].map((_, i) => (
            <NotificationSkeleton key={i} delay={i * 0.1} />
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  if (!grouped) {
    return (
      <div className={cn("p-0", className)}>
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[500px]">
          <div className="py-2">
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
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Grouped notifications
  const groups = groupNotificationsByDate(notifications);

  return (
    <div className={cn("p-0", className)}>
      <ScrollArea className="h-[calc(100vh-12rem)] md:h-[500px]">
        <div className="py-2">
          {groups.map((group, groupIndex) => (
            <AnimatedElement
              key={group.label}
              animation="fadeIn"
              delay={0.1 * groupIndex}
            >
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                <h3 className="text-sm font-medium text-muted-foreground px-4">
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
              {groupIndex < groups.length - 1 && <Separator />}
            </AnimatedElement>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
