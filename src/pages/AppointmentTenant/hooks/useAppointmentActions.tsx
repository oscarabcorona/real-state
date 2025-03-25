import { useState } from "react";
import {
  cancelAppointment,
  checkTimeSlotConflicts,
  generateTimeSlots,
  rescheduleAppointment,
  validateDate,
  validateTime,
} from "../../../services/appointmentTenantService";
import { Appointment, RescheduleForm } from "../types";

export function useAppointmentActions(onSuccess: () => Promise<void>) {
  const [processing, setProcessing] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: "",
    time: "",
    note: "",
  });
  const [cancelNote, setCancelNote] = useState("");

  // Update time slots when date changes
  const updateTimeSlots = (date: string) => {
    setTimeSlots(generateTimeSlots(date));
  };

  // Reschedule an appointment
  const handleReschedule = async (appointment: Appointment) => {
    if (!appointment) return;
    setProcessing(true);
    setTimeError("");

    try {
      // Validate the date and time
      const dateValidation = validateDate(rescheduleForm.date);
      if (!dateValidation.valid) {
        setTimeError(dateValidation.error || "Invalid date");
        setProcessing(false);
        return { success: false };
      }

      const timeValidation = validateTime(
        rescheduleForm.date,
        rescheduleForm.time
      );
      if (!timeValidation.valid) {
        setTimeError(timeValidation.error || "Invalid time");
        setProcessing(false);
        return { success: false };
      }

      // Check for conflicts
      const hasConflicts = await checkTimeSlotConflicts(
        appointment.property_id,
        appointment.id,
        rescheduleForm.date,
        rescheduleForm.time
      );

      if (hasConflicts) {
        setTimeError(
          "This time slot is already booked. Please select another time."
        );
        setProcessing(false);
        return { success: false };
      }

      // Reschedule the appointment
      const result = await rescheduleAppointment(
        appointment.id,
        rescheduleForm
      );

      if (result.success) {
        // Refresh appointment data
        await onSuccess();

        // Reset form
        setRescheduleForm({ date: "", time: "", note: "" });
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      return {
        success: false,
        message: "Failed to reschedule viewing request",
      };
    } finally {
      setProcessing(false);
    }
  };

  // Cancel an appointment
  const handleCancel = async (appointment: Appointment) => {
    if (!appointment) return;
    setProcessing(true);

    try {
      const result = await cancelAppointment(appointment.id, cancelNote);

      if (result.success) {
        await onSuccess();
        setCancelNote("");
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return {
        success: false,
        message: "Failed to cancel viewing request",
      };
    } finally {
      setProcessing(false);
    }
  };

  return {
    rescheduleForm,
    setRescheduleForm,
    cancelNote,
    setCancelNote,
    timeSlots,
    timeError,
    processing,
    updateTimeSlots,
    handleReschedule,
    handleCancel,
  };
}
