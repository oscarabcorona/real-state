import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { RescheduleForm } from "../types";

interface RescheduleContentProps {
  rescheduleForm: RescheduleForm;
  onUpdateForm: (form: RescheduleForm) => void;
  timeError: string;
  timeSlots: string[];
}

export function RescheduleContent({
  rescheduleForm,
  onUpdateForm,
  timeError,
  timeSlots,
}: RescheduleContentProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="date">Date</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <InfoIcon className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              Select a new date for your appointment
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="date"
          type="date"
          value={rescheduleForm.date}
          onChange={(e) =>
            onUpdateForm({ ...rescheduleForm, date: e.target.value })
          }
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="time">Time</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <InfoIcon className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>Select an available time slot</TooltipContent>
          </Tooltip>
        </div>
        {timeSlots.length > 0 ? (
          <Select
            value={rescheduleForm.time}
            onValueChange={(value) =>
              onUpdateForm({ ...rescheduleForm, time: value })
            }
          >
            <SelectTrigger id="time">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="time"
            type="time"
            value={rescheduleForm.time}
            onChange={(e) =>
              onUpdateForm({ ...rescheduleForm, time: e.target.value })
            }
            required
          />
        )}
        {timeError && <p className="text-sm text-red-500 mt-1">{timeError}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="note">Reason for rescheduling</Label>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <InfoIcon className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              Please explain why you need to reschedule this appointment
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          id="note"
          value={rescheduleForm.note}
          onChange={(e) =>
            onUpdateForm({ ...rescheduleForm, note: e.target.value })
          }
          placeholder="Please provide a reason for rescheduling"
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
