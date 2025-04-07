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
import { Appointment as CalendarAppointment } from "@/pages/Calendar/types";
import { Appointment as AppointmentsAppointment } from "@/pages/Appointments/types";
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

const statuses: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  confirmed: "text-green-700 bg-green-50 ring-green-600/20",
  cancelled: "text-red-700 bg-red-50 ring-red-600/20",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
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
                <div className="text-sm text-muted-foreground mt-1">
                  {appointment.properties?.address || "Address not available"}
                </div>
              </div>
              <div className="flex items-center gap-x-4">
                <span
                  className={classNames(
                    statuses[appointment.status || "pending"],
                    "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                  )}
                >
                  {appointment.status || "pending"}
                </span>
                <div className="relative">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-900"
                  >
                    <span className="sr-only">Open options</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {canReschedule && (
                      <button
                        onClick={onReschedule}
                        className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50 w-full text-left"
                      >
                        Reschedule
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={onCancel}
                        className="block px-3 py-1 text-sm leading-6 text-red-600 hover:bg-gray-50 w-full text-left"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Applicant</h4>
              <p className="mt-1 text-sm text-gray-500">{appointment.name}</p>
              <p className="text-sm text-gray-500">{appointment.email}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Date & Time</h4>
              <p className="mt-1 text-sm text-gray-500">
                {format(new Date(appointment.preferred_date), "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                {appointment.preferred_time}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Documents</h4>
              <p className="mt-1 text-sm text-gray-500">
                {appointment.documents_verified ? "Verified" : "Pending"}
              </p>
            </div>

            {appointment.message && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Message</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {appointment.message}
                </p>
              </div>
            )}

            {userRole === "lessor" && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                <Textarea
                  value={lessorNotes}
                  onChange={(e) => onLessorNotesChange?.(e.target.value)}
                  placeholder="Add any notes about this viewing request..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            )}
          </div>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
