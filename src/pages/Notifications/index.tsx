import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Notification } from "./types";
import { NotificationsList } from "./components/NotificationsList";
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { AnimatedText } from "@/components/animated/AnimatedText";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "../../services/notificationService";
import {
  filterNotificationsByType,
  sortNotifications,
} from "./utils/notificationHelpers";
import { NotificationFilters } from "./components/NotificationFilters";

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

  // Apply filters when notifications, filter or sort changes
  useEffect(() => {
    if (notifications.length) {
      const filtered = filterNotificationsByType(notifications, activeFilter);
      setFilteredNotifications(filtered);
    }
  }, [notifications, activeFilter]);

  const handleFilterChange = (type: string | null) => {
    setActiveFilter(type);
  };

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

  return (
    <div className="space-y-4">
      <AnimatedElement animation="fadeIn" duration={0.5}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  <AnimatedText text="Notifications" delay={0.1} />
                </h1>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {unreadCount} unread
                  </span>
                )}
              </div>

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
        </div>
      </AnimatedElement>
    </div>
  );
}
