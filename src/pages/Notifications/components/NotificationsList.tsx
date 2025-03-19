import { Notification } from "../types";
import { EmptyState } from "./EmptyState";
import { NotificationItem } from "./NotificationItem";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NotificationsListProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  className?: string;
  loading?: boolean;
};

export function NotificationsList({
  notifications,
  onMarkAsRead,
  className,
  loading = false,
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

  return (
    <Card className={cn("p-1", className)}>
      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md">
        {notifications.map((notification, index) => (
          <div key={notification.id}>
            <NotificationItem
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
            {index < notifications.length - 1 && <Separator className="mx-4" />}
          </div>
        ))}
      </ScrollArea>
    </Card>
  );
}
