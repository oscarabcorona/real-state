import { useEffect, useState } from "react";
import {
  cancelAppointment,
  checkTimeSlotConflicts,
  fetchTenantAppointments,
  generateTimeSlots,
  rescheduleAppointment,
  validateDate,
  validateTime,
} from "../../services/appointmentTenantService";
import { useAuthStore } from "../../store/authStore";
import { CancelModal } from "./components/CancelModal";
import { DetailsModal } from "./components/DetailsModal";
import { RescheduleModal } from "./components/RescheduleModal";
import { MainAppointmentsList } from "./MainAppointmentsList";
import { Appointment, RescheduleForm } from "./types";
import { UpcomingAppointmentsSection } from "./UpcomingAppointmnetsSection";

export function AppointmentTenant() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: "",
    time: "",
    note: "",
  });
  const [cancelNote, setCancelNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (rescheduleForm.date) {
      setTimeSlots(generateTimeSlots(rescheduleForm.date));
    }
  }, [rescheduleForm.date]);

  const fetchAppointments = async () => {
    try {
      const data = await fetchTenantAppointments(user?.id || "");
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);
    setTimeError("");

    try {
      // Validate the date and time
      const dateValidation = validateDate(rescheduleForm.date);
      if (!dateValidation.valid) {
        setTimeError(dateValidation.error || "Invalid date");
        return;
      }

      const timeValidation = validateTime(
        rescheduleForm.date,
        rescheduleForm.time
      );
      if (!timeValidation.valid) {
        setTimeError(timeValidation.error || "Invalid time");
        return;
      }

      // Check for conflicts
      const hasConflicts = await checkTimeSlotConflicts(
        selectedAppointment.property_id,
        selectedAppointment.id,
        rescheduleForm.date,
        rescheduleForm.time
      );

      if (hasConflicts) {
        setTimeError(
          "This time slot is already booked. Please select another time."
        );
        return;
      }

      // Reschedule the appointment
      const result = await rescheduleAppointment(
        selectedAppointment.id,
        rescheduleForm
      );

      if (result.success) {
        // Refresh appointment data
        await fetchAppointments();

        // Reset and close modals
        setShowRescheduleModal(false);
        setShowDetailsModal(false);
        setRescheduleForm({ date: "", time: "", note: "" });
        alert(result.message || "Viewing request rescheduled successfully");
      } else {
        alert(result.message || "Failed to reschedule viewing request");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      alert("Failed to reschedule viewing request");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);

    try {
      const result = await cancelAppointment(
        selectedAppointment.id,
        cancelNote
      );

      if (result.success) {
        await fetchAppointments();
        setShowCancelModal(false);
        setShowDetailsModal(false);
        setCancelNote("");
        alert(result.message || "Viewing request cancelled successfully");
      } else {
        alert(result.message || "Failed to cancel viewing request");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel viewing request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments Section */}
      <UpcomingAppointmentsSection
        appointments={appointments}
        setSelectedAppointment={setSelectedAppointment}
        setShowDetailsModal={setShowDetailsModal}
      />

      {/* Main Appointments List */}
      <MainAppointmentsList
        appointments={appointments}
        setSelectedAppointment={setSelectedAppointment}
        setShowDetailsModal={setShowDetailsModal}
        setShowRescheduleModal={setShowRescheduleModal}
        setShowCancelModal={setShowCancelModal}
      />

      {/* Modals */}
      {showDetailsModal && selectedAppointment && (
        <DetailsModal
          appointment={selectedAppointment}
          onClose={() => setShowDetailsModal(false)}
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

      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          rescheduleForm={rescheduleForm}
          onUpdateForm={setRescheduleForm}
          onClose={() => setShowRescheduleModal(false)}
          onReschedule={handleReschedule}
          processing={processing}
          timeError={timeError}
          timeSlots={timeSlots}
        />
      )}

      {showCancelModal && selectedAppointment && (
        <CancelModal
          cancelNote={cancelNote}
          onUpdateNote={setCancelNote}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancel}
          processing={processing}
        />
      )}
    </div>
  );
}
