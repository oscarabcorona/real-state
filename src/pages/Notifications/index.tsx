import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Notification } from "./types";
import { NotificationsList } from "./components/NotificationsList";
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "../../services/notificationService";
import {
  filterNotificationsByType,
  filterNotificationsByReadStatus,
  sortNotifications,
} from "./utils/notificationHelpers";
import { NotificationFilters } from "./components/NotificationFilters";
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchUserNotifications(user.id);
          const sortedData = sortNotifications(data, sortOrder);
          setNotifications(sortedData);
          setFilteredNotifications(sortedData);
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

  // Apply filters when notifications, filter, sort, or read status changes
  useEffect(() => {
    if (notifications.length) {
      const typeFiltered = filterNotificationsByType(
        notifications,
        activeFilter
      );
      const readFiltered = showUnreadOnly
        ? filterNotificationsByReadStatus(typeFiltered, false)
        : typeFiltered;
      setFilteredNotifications(readFiltered);
    }
  }, [notifications, activeFilter, showUnreadOnly]);

  const handleFilterChange = (type: string | null) => {
    setActiveFilter(type);
  };

  const handleSortChange = (order: "newest" | "oldest") => {
    setSortOrder(order);
    setNotifications((prev) => sortNotifications(prev, order));
  };

  const handleToggleUnreadOnly = () => {
    setShowUnreadOnly(!showUnreadOnly);
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

  return (
    <div className="space-y-4">
      <AnimatedElement animation="fadeIn" duration={0.5}>
        <Card className="overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Toggle
                  pressed={showUnreadOnly}
                  onPressedChange={handleToggleUnreadOnly}
                  size="sm"
                  variant="outline"
                  className="gap-1 h-8"
                >
                  {showUnreadOnly ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  <span className="text-xs">
                    {showUnreadOnly ? "Unread only" : "All messages"}
                  </span>
                </Toggle>
              </div>
            </div>

            <div className="mt-3">
              <NotificationFilters
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                unreadCount={unreadCount}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
          </div>

          <NotificationsList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            loading={loading}
            grouped={true}
          />
        </Card>
      </AnimatedElement>
    </div>
  );
}
