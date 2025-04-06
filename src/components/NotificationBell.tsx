import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("read", false);

        if (error) {
          console.error("Error fetching notification count:", error);
          return;
        }

        setCount(count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchNotificationCount
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchNotificationCount
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      asChild
      aria-label={t("common.notifications", "Notifications")}
    >
      <Link to="/dashboard/notifications">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
