import { format, isAfter, isBefore, set } from "date-fns";
import { supabase } from "../lib/supabase";
import { 
  Appointment, 
  RescheduleForm, 
  ValidationResult, 
  AppointmentActionResult,
  AppointmentStatus
} from "../pages/AppointmentTenant/types";
import { VIEWING_RULES } from "../pages/AppointmentTenant/const";

/**
 * Fetch all appointments for the tenant
 */
export async function fetchTenantAppointments(userId: string): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        properties (
          name,
          address,
          city,
          state
        )
      `
      )
      .or(`tenant_user_id.eq.${userId},email.eq.${userId}`);

    if (error) throw error;

    // Transform the data to ensure it matches our Appointment type
    // Specifically, handle nullable status by defaulting to "pending"
    const appointments = (data || []).map(appointment => ({
      ...appointment,
      // Ensure status is always one of our defined types
      status: (appointment.status as AppointmentStatus) || "pending"
    })) as Appointment[];
    
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

/**
 * Generate available time slots for a selected date
 */
export function generateTimeSlots(selectedDate: string): string[] {
  const slots: string[] = [];
  const date = new Date(selectedDate);

  if (
    isBefore(date, new Date()) ||
    VIEWING_RULES.excludeDays.includes(date.getDay())
  ) {
    return slots;
  }

  let currentTime = set(date, {
    hours: parseInt(VIEWING_RULES.startTime.split(":")[0]),
    minutes: parseInt(VIEWING_RULES.startTime.split(":")[1]),
    seconds: 0,
    milliseconds: 0,
  });

  const endTime = set(date, {
    hours: parseInt(VIEWING_RULES.endTime.split(":")[0]),
    minutes: parseInt(VIEWING_RULES.endTime.split(":")[1]),
    seconds: 0,
    milliseconds: 0,
  });

  while (isBefore(currentTime, endTime)) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = new Date(
      currentTime.getTime() + VIEWING_RULES.duration * 60000
    );
  }

  return slots;
}

/**
 * Validate that a selected date is valid for booking
 */
export function validateDate(date: string): ValidationResult {
  const selectedDate = new Date(date);
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + VIEWING_RULES.daysInAdvance);

  if (isBefore(selectedDate, now)) {
    return { valid: false, error: "Please select a future date" };
  }

  if (isAfter(selectedDate, maxDate)) {
    return { 
      valid: false, 
      error: `Appointments can only be scheduled up to ${VIEWING_RULES.daysInAdvance} days in advance` 
    };
  }

  if (VIEWING_RULES.excludeDays.includes(selectedDate.getDay())) {
    return { valid: false, error: "Appointments are not available on weekends" };
  }

  return { valid: true };
}

/**
 * Validate that a selected time is valid for booking
 */
export function validateTime(date: string, time: string): ValidationResult {
  const selectedDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const minDateTime = new Date(
    now.getTime() + VIEWING_RULES.minNotice * 60 * 60 * 1000
  );

  if (isBefore(selectedDateTime, minDateTime)) {
    return { 
      valid: false, 
      error: `Please select a time at least ${VIEWING_RULES.minNotice} hours in advance` 
    };
  }

  return { valid: true };
}

/**
 * Check if a time slot is already booked
 */
export async function checkTimeSlotConflicts(
  propertyId: string, 
  appointmentId: string,
  date: string,
  time: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("appointments")
      .select("id")
      .eq("property_id", propertyId)
      .eq("preferred_date", date)
      .eq("preferred_time", time)
      .neq("id", appointmentId)
      .eq("status", "confirmed");

    return data ? data.length > 0 : false;
  } catch (error) {
    console.error("Error checking time slot conflicts:", error);
    throw error;
  }
}

/**
 * Reschedule an existing appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  rescheduleData: RescheduleForm
): Promise<AppointmentActionResult> {
  try {
    const { error } = await supabase
      .from("appointments")
      .update({
        preferred_date: rescheduleData.date,
        preferred_time: rescheduleData.time,
        tenant_notes: rescheduleData.note,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (error) throw error;
    
    return { success: true, message: "Appointment rescheduled successfully" };
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return { 
      success: false, 
      message: "Failed to reschedule appointment", 
      error: error as Error 
    };
  }
}

/**
 * Cancel an existing appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  cancelNote: string
): Promise<AppointmentActionResult> {
  try {
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        tenant_notes: cancelNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (error) throw error;
    
    return { success: true, message: "Appointment cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { 
      success: false, 
      message: "Failed to cancel appointment", 
      error: error as Error 
    };
  }
}
