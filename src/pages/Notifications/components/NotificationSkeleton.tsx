import { AnimatedElement } from "@/components/animated/AnimatedElement";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationSkeletonProps {
  delay?: number;
}

export function NotificationSkeleton({ delay = 0 }: NotificationSkeletonProps) {
  return (
    <AnimatedElement
      animation="fadeIn"
      delay={delay}
      className="p-4 border-b last:border-b-0"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
}
