import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Appointment } from "../types";
import { getStatusClass, getStatusIcon, getStatusText } from "../utils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppointmentDetailsSheetProps {
  appointment: Appointment;
  userRole?: string;
  lessorNotes: string;
  onLessorNotesChange: (notes: string) => void;
  onClose: () => void;
  onStatusChange: (
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) => void;
  open: boolean;
}

export function AppointmentDetailsSheet({
  appointment,
  userRole,
  lessorNotes,
  onLessorNotesChange,
  onClose,
  onStatusChange,
  open,
}: AppointmentDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Viewing Request Details</SheetTitle>
          <SheetDescription>
            Review and manage the viewing request details
          </SheetDescription>
        </SheetHeader>

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
                <TableCell className="font-medium py-3 pl-0 w-1/3">
                  Applicant
                </TableCell>
                <TableCell className="py-3 pr-0">{appointment.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0">Date</TableCell>
                <TableCell className="py-3 pr-0">
                  {format(new Date(appointment.preferred_date), "MMMM d, yyyy")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0">Time</TableCell>
                <TableCell className="py-3 pr-0">
                  {appointment.preferred_time}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0">Status</TableCell>
                <TableCell className="py-3 pr-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">
                          {getStatusText(appointment.status)}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {appointment.status === "confirmed"
                        ? "This appointment has been confirmed"
                        : appointment.status === "cancelled"
                        ? "This appointment has been cancelled"
                        : "This appointment is awaiting confirmation"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0">
                  Documents
                </TableCell>
                <TableCell className="py-3 pr-0">
                  {appointment.documents_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  )}
                </TableCell>
              </TableRow>

              {appointment.message && (
                <TableRow>
                  <TableCell className="font-medium py-3 pl-0">
                    Message
                  </TableCell>
                  <TableCell className="py-3 pr-0 whitespace-normal">
                    {appointment.message}
                  </TableCell>
                </TableRow>
              )}

              {userRole === "lessor" && (
                <TableRow>
                  <TableCell className="font-medium py-3 pl-0">Notes</TableCell>
                  <TableCell className="py-3 pr-0">
                    <Textarea
                      value={lessorNotes}
                      onChange={(e) => onLessorNotesChange(e.target.value)}
                      placeholder="Add any notes about this viewing request..."
                      className="min-h-[80px]"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <SheetFooter className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {userRole === "lessor" && appointment.status === "pending" && (
            <>
              <Button
                variant="destructive"
                onClick={() => onStatusChange(appointment.id, "cancelled")}
              >
                Decline
              </Button>
              <Button
                variant="default"
                onClick={() => onStatusChange(appointment.id, "confirmed")}
              >
                Confirm
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
