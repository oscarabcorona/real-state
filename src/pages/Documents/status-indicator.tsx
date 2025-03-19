import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusClass, getStatusIcon, getStatusText } from "./utils";

export const StatusIndicator = ({
  status,
  verified,
}: {
  status: string;
  verified: boolean;
}) => {
  const tooltipText = verified
    ? "Document has been verified"
    : status === "signed"
    ? "Document has been signed"
    : status === "rejected"
    ? "Document has been rejected"
    : "Document is waiting for review";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
            status,
            verified
          )}`}
        >
          {getStatusIcon(status, verified)}
          <span className="ml-1.5">{getStatusText(status, verified)}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
