import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

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
        <Label htmlFor="cancelNote">Reason for cancellation</Label>
        <Textarea
          id="cancelNote"
          value={cancelNote}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Please provide a reason for cancelling this appointment"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          This action cannot be undone. The property owner will be notified.
        </p>
      </div>
    </div>
  );
}
