import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "pending" | "verified" | "rejected";
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      className: "text-yellow-500",
    },
    verified: {
      icon: CheckCircle2,
      label: "Verified",
      className: "text-green-500",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "text-red-500",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1", config.className)}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
