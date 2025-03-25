import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Appointment, RescheduleForm } from "../types";
import { DetailsContent } from "./DetailsContent";
import { RescheduleContent } from "./RescheduleContent";
import { CancelContent } from "./CancelContent";

// Define proper types for props passed to child components
interface RescheduleContentProps {
  rescheduleForm: RescheduleForm;
  onUpdateForm: (form: RescheduleForm) => void;
  timeError: string;
  timeSlots: string[];
}

interface CancelContentProps {
  cancelNote: string;
  onUpdateNote: (note: string) => void;
}

interface AppointmentSheetsProps {
  selectedAppointment: Appointment | null;
  showDetailsModal: boolean;
  setShowDetailsModal: (show: boolean) => void;
  showRescheduleModal: boolean;
  setShowRescheduleModal: (show: boolean) => void;
  showCancelModal: boolean;
  setShowCancelModal: (show: boolean) => void;
  // Replace 'any' with specific types
  rescheduleProps: RescheduleContentProps;
  cancelProps: CancelContentProps;
  onReschedule: () => void;
  onCancel: () => void;
  processing: boolean;
}

export function AppointmentSheets({
  selectedAppointment,
  showDetailsModal,
  setShowDetailsModal,
  showRescheduleModal,
  setShowRescheduleModal,
  showCancelModal,
  setShowCancelModal,
  rescheduleProps,
  cancelProps,
  onReschedule,
  onCancel,
  processing,
}: AppointmentSheetsProps) {
  const handleBackToDetails = () => {
    if (showRescheduleModal) {
      setShowRescheduleModal(false);
      setShowDetailsModal(true);
    } else if (showCancelModal) {
      setShowCancelModal(false);
      setShowDetailsModal(true);
    }
  };

  return (
    <>
      {/* Details Sheet */}
      <Sheet open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Appointment Details</SheetTitle>
            <SheetDescription>
              View the details of your property viewing appointment
            </SheetDescription>
          </SheetHeader>

          {selectedAppointment && (
            <DetailsContent
              appointment={selectedAppointment}
              onReschedule={() => {
                setShowDetailsModal(false);
                setShowRescheduleModal(true);
              }}
              onCancel={() => {
                setShowDetailsModal(false);
                setShowCancelModal(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Reschedule Sheet */}
      <Sheet open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleBackToDetails}
                aria-label="Back to appointment details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div>
                <SheetTitle>Reschedule Appointment</SheetTitle>
                <SheetDescription>
                  Change the date and time of your property viewing
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedAppointment && (
            <div className="px-6 py-4 overflow-y-auto">
              <RescheduleContent {...rescheduleProps} />
            </div>
          )}

          <SheetFooter className="px-6 py-4 border-t">
            <SheetClose asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close without saving changes</TooltipContent>
              </Tooltip>
            </SheetClose>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onReschedule}
                  disabled={
                    processing ||
                    !rescheduleProps.rescheduleForm.date ||
                    !rescheduleProps.rescheduleForm.time
                  }
                >
                  {processing ? "Processing..." : "Reschedule"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Submit your reschedule request</TooltipContent>
            </Tooltip>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Cancel Sheet */}
      <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleBackToDetails}
                aria-label="Back to appointment details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div>
                <SheetTitle>Cancel Appointment</SheetTitle>
                <SheetDescription>
                  Provide a reason for cancelling your property viewing
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedAppointment && (
            <div className="px-6 py-4 overflow-y-auto">
              <CancelContent {...cancelProps} />
            </div>
          )}

          <SheetFooter className="px-6 py-4 border-t">
            <SheetClose asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Close without cancelling appointment
                </TooltipContent>
              </Tooltip>
            </SheetClose>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onCancel}
                  disabled={processing || !cancelProps.cancelNote.trim()}
                  variant="destructive"
                >
                  {processing ? "Processing..." : "Confirm Cancellation"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Permanently cancel this appointment
              </TooltipContent>
            </Tooltip>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
