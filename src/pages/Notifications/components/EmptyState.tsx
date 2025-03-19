import { Bell } from "lucide-react";

export function EmptyState() {
  return (
    <div className="p-6 text-center">
      <Bell className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No notifications
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        You're all caught up! Check back later for updates.
      </p>
    </div>
  );
}
