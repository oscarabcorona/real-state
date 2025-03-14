import { format } from "date-fns";
import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Notification } from "./types";

export function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Subscribe to realtime notifications
      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            if (!(payload.new as Notification).read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_scheduled":
      case "appointment_confirmed":
      case "appointment_cancelled":
      case "appointment_rescheduled":
        return <Calendar className="h-6 w-6 text-indigo-500" />;
      case "document_verified":
      case "document_rejected":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "payment_received":
      case "payment_due":
        return <CreditCard className="h-6 w-6 text-green-500" />;
      case "report_ready":
        return <CheckCircle className="h-6 w-6 text-purple-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-400" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "appointment_scheduled":
      case "appointment_confirmed":
      case "appointment_cancelled":
      case "appointment_rescheduled":
        return `/dashboard/appointments`;
      case "document_verified":
      case "document_rejected":
        return `/dashboard/documents`;
      case "payment_received":
      case "payment_due":
        return `/dashboard/payments`;
      case "report_ready":
        return `/dashboard/reports`;
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 ${!notification.read ? "bg-indigo-50" : ""}`}
              >
                <div className="flex items-start">
                  {getNotificationIcon(notification.type)}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <div className="ml-4 flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {format(
                            new Date(notification.created_at),
                            "MMM d, h:mm a"
                          )}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-2">
                      <a
                        href={getNotificationLink(notification)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        View details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
