import { Notification } from "../types";
import { EmptyState } from "./EmptyState";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          <div className="space-y-0.5 px-1 py-2">
            {notifications.map((notification, index) => (
              <AnimatedElement
                key={notification.id}
                animation="fadeIn"
                delay={index * 0.05}
              >
                <div className="hover:bg-muted/30 transition-colors rounded-md">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                </div>
              </AnimatedElement>
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
        <div className="space-y-6 px-2 py-3">
          {groups.map((group, groupIndex) => (
            <AnimatedElement
              key={group.label}
              animation="fadeIn"
              delay={0.1 * groupIndex}
            >
              <div className="rounded-md overflow-hidden">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 px-3 border-b">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </h3>
                </div>
                <div className="divide-y divide-border/60">
                  {group.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={onMarkAsRead}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
