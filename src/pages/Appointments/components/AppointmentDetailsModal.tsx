import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Appointment } from "../types";
import { getStatusClass, getStatusIcon, getStatusText } from "../utils";

interface AppointmentDetailsModalProps {
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

export function AppointmentDetailsModal({
  appointment,
  userRole,
  lessorNotes,
  onLessorNotesChange,
  onClose,
  onStatusChange,
  open,
}: AppointmentDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Viewing Request Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-accent/20 p-4 rounded-lg">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Property
                </dt>
                <dd className="text-sm">{appointment.properties.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Applicant
                </dt>
                <dd className="text-sm">{appointment.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Date
                </dt>
                <dd className="text-sm">
                  {format(new Date(appointment.preferred_date), "MMMM d, yyyy")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Time
                </dt>
                <dd className="text-sm">{appointment.preferred_time}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Status
                </dt>
                <dd className="text-sm">
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
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Documents
                </dt>
                <dd className="text-sm">
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
                </dd>
              </div>
            </dl>
          </div>

          {appointment.message && (
            <div>
              <h4 className="text-sm font-medium mb-1">Message</h4>
              <p className="text-sm text-muted-foreground bg-accent/20 p-3 rounded-md">
                {appointment.message}
              </p>
            </div>
          )}

          {userRole === "lessor" && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={lessorNotes}
                onChange={(e) => onLessorNotesChange(e.target.value)}
                placeholder="Add any notes about this viewing request..."
                className="min-h-[80px]"
              />
            </div>
          )}

          <DialogFooter className="flex justify-end space-x-3 pt-4 border-t">
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
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
