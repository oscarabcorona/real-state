import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { AnimatedText } from "@/components/animated/AnimatedText";

export function EmptyState() {
  return (
    <AnimatedElement animation="scale" duration={0.4}>
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto p-3 bg-muted inline-block rounded-full mb-2">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>
            <AnimatedText text="No notifications yet" delay={0.2} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm text-center mb-6">
            You're all caught up! When you have notifications, they will appear
            here.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Refresh notifications
          </Button>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
}
