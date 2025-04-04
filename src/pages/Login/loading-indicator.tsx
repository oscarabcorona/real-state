import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className="size-10 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading your account...</p>
    </div>
  );
}
