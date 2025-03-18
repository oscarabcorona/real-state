import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => (
  <Card className="overflow-hidden h-full">
    <AspectRatio ratio={16 / 9}>
      <Skeleton className="h-full w-full" />
    </AspectRatio>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-[80px]" />
        </div>
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-[40px]" />
          <Skeleton className="h-4 w-[40px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </div>
    </CardContent>
    <CardFooter className="px-4 py-3 border-t">
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);
