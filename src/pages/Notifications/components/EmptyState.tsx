import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedElement } from "@/components/animated/AnimatedElement";

export function EmptyState() {
  return (
    <AnimatedElement animation="scale" duration={0.4}>
      <div className="text-center py-12 px-4">
        <div className="mx-auto p-4 bg-muted inline-block rounded-full mb-3">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          You're all caught up! When you have notifications, they will appear
          here.
        </p>
        <Button
          variant="outline"
          className="mx-auto"
          onClick={() => window.location.reload()}
        >
          Refresh notifications
        </Button>
      </div>
    </AnimatedElement>
  );
}
