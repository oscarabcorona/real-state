import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ImagePlaceholder({
  className,
  ...props
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        className
      )}
      {...props}
    >
      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
    </div>
  );
}
