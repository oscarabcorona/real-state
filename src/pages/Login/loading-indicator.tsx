export function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <p className="text-sm text-muted-foreground">
        Preparing your dashboard...
      </p>
    </div>
  );
}
