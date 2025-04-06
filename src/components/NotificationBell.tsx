import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import {
  Notification,
  NotificationPriority,
} from "@/pages/Notifications/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [highPriorityExists, setHighPriorityExists] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Fetch unread notifications
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching notifications:", error);
          return;
        }

        const notificationData = data as Notification[];
        setCount(notificationData.length);

        // Check if there are any high priority notifications
        const hasHighPriority = notificationData.some(
          (notification) => notification.priority === NotificationPriority.HIGH
        );
        setHighPriorityExists(hasHighPriority);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

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
        fetchNotifications
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        fetchNotifications
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Determine the bell color based on notifications
  let bellColorClass = "text-muted-foreground"; // Default color

  if (count > 0) {
    bellColorClass = highPriorityExists
      ? "text-destructive animate-pulse" // Red and pulsing for high priority
      : "text-primary"; // Primary color for normal notifications
  }

  const tooltipText =
    count === 0
      ? t("notifications.noNew", "No new notifications")
      : t("notifications.unread", "{{count}} unread notifications", { count });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
            aria-label={t("common.notifications", "Notifications")}
          >
            <Link to="/dashboard/notifications">
              <Bell className={`h-5 w-5 ${bellColorClass}`} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
