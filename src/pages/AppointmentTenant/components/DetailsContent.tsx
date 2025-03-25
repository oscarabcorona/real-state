import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Appointment } from "../../Calendar/types";

interface DetailsContentProps {
  appointment: Appointment;
  onReschedule: () => void;
  onCancel: () => void;
}

export function DetailsContent({
  appointment,
  onReschedule,
  onCancel,
}: DetailsContentProps) {
  // Determine if the appointment can be rescheduled or cancelled
  const canReschedule =
    appointment.status === "pending" || appointment.status === "confirmed";
  const canCancel =
    appointment.status === "pending" || appointment.status === "confirmed";

  // Format date and time for display
  const formattedDate = appointment.preferred_date
    ? format(new Date(appointment.preferred_date), "MMMM d, yyyy")
    : "Not specified";

  const formattedTime = appointment.preferred_time || "Not specified";

  return (
    <div className="px-6 overflow-y-auto">
      <div className="mb-4 border-b pb-3">
        <h3 className="text-base font-semibold">
          {appointment.properties?.name || "Unknown property"}
        </h3>
        <p className="text-sm text-gray-500">
          {appointment.properties?.address || "Address not available"}
        </p>
      </div>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium py-3 pl-0 w-1/3">Date</TableCell>
            <TableCell className="py-3 pr-0">{formattedDate}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium py-3 pl-0">Time</TableCell>
            <TableCell className="py-3 pr-0">{formattedTime}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium py-3 pl-0">Status</TableCell>
            <TableCell className="py-3 pr-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium cursor-help
                    ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {appointment.status === "confirmed"
                    ? "This appointment has been confirmed by the property owner"
                    : appointment.status === "cancelled"
                    ? "This appointment has been cancelled"
                    : "This appointment is awaiting confirmation from the property owner"}
                </TooltipContent>
              </Tooltip>
            </TableCell>
          </TableRow>

          {appointment.message && (
            <TableRow>
              <TableCell className="font-medium py-3 pl-0">Message</TableCell>
              <TableCell className="py-3 pr-0 whitespace-normal">
                {appointment.message}
              </TableCell>
            </TableRow>
          )}

          {appointment.tenant_notes && (
            <TableRow>
              <TableCell className="font-medium py-3 pl-0">
                Your Notes
              </TableCell>
              <TableCell className="py-3 pr-0 whitespace-normal">
                {appointment.tenant_notes}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        {canReschedule && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onReschedule} variant="outline">
                Reschedule
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Request a different date and time for this appointment
            </TooltipContent>
          </Tooltip>
        )}

        {canCancel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onCancel} variant="destructive">
                Cancel Appointment
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Cancel this appointment (cannot be undone)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
