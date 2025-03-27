import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, MapPin, User } from "lucide-react";
import { Appointment as CalendarAppointment } from "@/pages/Calendar/types";
import { Appointment as AppointmentsAppointment } from "@/pages/Appointments/types";
import {
  getStatusClass,
  getStatusIcon,
  getStatusText,
} from "@/pages/Calendar/utils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

type Appointment = CalendarAppointment | AppointmentsAppointment;

interface AppointmentDetailsSheetProps {
  appointment: Appointment;
  userRole?: "lessor" | "tenant";
  lessorNotes?: string;
  onLessorNotesChange?: (notes: string) => void;
  onClose: () => void;
  onStatusChange?: (
    appointmentId: string,
    status: "confirmed" | "cancelled"
  ) => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  open: boolean;
}

export function AppointmentDetailsSheet({
  appointment,
  userRole,
  lessorNotes,
  onLessorNotesChange,
  onClose,
  onStatusChange,
  onReschedule,
  onCancel,
  open,
}: AppointmentDetailsSheetProps) {
  // Determine if the appointment can be rescheduled or cancelled
  const canReschedule =
    appointment.status === "pending" || appointment.status === "confirmed";
  const canCancel =
    appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Viewing Request Details</SheetTitle>
              <SheetDescription>
                Review and manage the viewing request details
              </SheetDescription>
            </div>
            <SheetClose className="h-4 w-4" />
          </div>
        </SheetHeader>

        <div className="px-6 overflow-y-auto">
          {/* Property Header */}
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {appointment.properties?.name || "Unknown property"}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {appointment.properties?.address || "Address not available"}
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      appointment.status || "pending"
                    )}`}
                  >
                    {getStatusIcon(appointment.status || "pending")}
                    <span className="ml-1">
                      {getStatusText(appointment.status || "pending")}
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
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details Table */}
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0 w-1/3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Applicant
                  </div>
                </TableCell>
                <TableCell className="py-3 pr-0">
                  <div className="font-medium">{appointment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.email}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-3 pl-0">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Date & Time
                  </div>
                </TableCell>
                <TableCell className="py-3 pr-0">
                  <div className="font-medium">
                    {format(
                      new Date(appointment.preferred_date),
                      "MMMM d, yyyy"
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.preferred_time}
                  </div>
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
                    <div className="bg-muted/50 p-3 rounded-md">
                      {appointment.message}
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {userRole === "lessor" && (
                <TableRow>
                  <TableCell className="font-medium py-3 pl-0">Notes</TableCell>
                  <TableCell className="py-3 pr-0">
                    <Textarea
                      value={lessorNotes}
                      onChange={(e) => onLessorNotesChange?.(e.target.value)}
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
                onClick={() => onStatusChange?.(appointment.id, "cancelled")}
              >
                Decline
              </Button>
              <Button
                variant="default"
                onClick={() => onStatusChange?.(appointment.id, "confirmed")}
              >
                Confirm
              </Button>
            </>
          )}
          {userRole === "tenant" && canReschedule && (
            <Button variant="outline" onClick={onReschedule}>
              Reschedule
            </Button>
          )}
          {userRole === "tenant" && canCancel && (
            <Button variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
