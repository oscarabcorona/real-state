import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Notification } from "@/pages/Notifications/types";
import { Database } from "@/types/database.types";

type DbNotification = Database['public']['Tables']['notifications']['Row'];

/**
 * Transform database notification to Notification type
 */
function transformNotification(dbNotification: DbNotification): Notification {
  // Convert the JSON data field to Record<string, string> or empty object if null
  const notificationData: Record<string, string> = dbNotification.data 
    ? (typeof dbNotification.data === 'object' && dbNotification.data !== null
       ? Object.entries(dbNotification.data).reduce((acc, [key, value]) => {
           // Convert all values to strings
           acc[key] = String(value);
           return acc;
         }, {} as Record<string, string>)
       : {})
    : {};
  
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type,
    read: dbNotification.read || false,
    created_at: dbNotification.created_at || new Date().toISOString(),  
    data: notificationData
  };
}

/**
 * Fetch all notifications for a specific user
 */
export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Transform the database notifications to match the Notification type
    return (data || []).map(transformNotification);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time notification updates
 * Returns subscription that should be unsubscribed when no longer needed
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: Notification) => void
): RealtimeChannel {
  return supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Transform the new notification before passing it to the callback
        const dbNotification = payload.new as DbNotification;
        const notification = transformNotification(dbNotification);
        onNewNotification(notification);
      }
    )
    .subscribe();
}
