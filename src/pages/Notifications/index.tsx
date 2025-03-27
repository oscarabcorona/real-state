import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Notification } from "./types";
import { NotificationsList } from "./components/NotificationsList";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "../../services/notificationService";
import { sortNotifications } from "./utils/notificationHelpers";
import { Button } from "@/components/ui/button";
import { Eye, Filter, BellRing } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchUserNotifications(user.id);
          const sortedData = sortNotifications(data, sortOrder);
          setNotifications(sortedData);
          setUnreadCount(data.filter((n) => !n.read).length);
        } catch (error) {
          console.error("Error in component fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      // Subscribe to realtime notifications
      const subscription = subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            return sortNotifications(updated, sortOrder);
          });

          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, sortOrder]);

  const handleSortChange = (order: "newest" | "oldest") => {
    setSortOrder(order);
    setNotifications((prev) => sortNotifications(prev, order));
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error in component marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Error in component marking all notifications as read:",
        error
      );
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="text-sm text-blue-600">{unreadCount} unread</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            defaultValue={sortOrder}
            onValueChange={(v: "newest" | "oldest") => handleSortChange(v)}
          >
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Filter className="h-4 w-4" />
                {filter === "all" ? "All Notifications" : "Unread"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2 h-8"
            >
              <Eye className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border">
        <NotificationsList
          notifications={filteredNotifications}
          onMarkAsRead={handleMarkAsRead}
          loading={loading}
          grouped={true}
        />
      </div>
    </div>
  );
}
