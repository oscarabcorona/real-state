import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, InfoIcon } from "lucide-react";

interface CancelContentProps {
  cancelNote: string;
  onUpdateNote: (note: string) => void;
}

export function CancelContent({
  cancelNote,
  onUpdateNote,
}: CancelContentProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="cancelNote">Reason for cancellation</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <InfoIcon className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              Please explain why you need to cancel this appointment
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="cancelNote"
          value={cancelNote}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Please provide a reason for cancelling this appointment"
          rows={4}
          className="resize-none"
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2 cursor-help">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              This action cannot be undone. The property owner will be notified.
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Once cancelled, you may need to create a new appointment request if
          you change your mind
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
