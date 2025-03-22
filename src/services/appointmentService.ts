import { supabase } from "../lib/supabase";
import { Appointment, AppointmentCreate, AppointmentStatusUpdate } from "@/pages/Appointments/types";
import { addDays } from "date-fns";
import { handleServiceError } from "./utilityService";

/**
 * Fetch appointments for a user based on their role
 */
export async function fetchUserAppointments(
  userId: string,
  userRole?: string
): Promise<Appointment[]> {
  try {
    let query = supabase.from("appointments").select(`
      *,
      properties (
        name,
        address,
        city,
        state
      )
    `);

    // Filter appointments based on user role
    if (userRole === "lessor") {
      // First get the property IDs for this lessor
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select("id")
        .eq("user_id", userId);

      if (propertyError) throw propertyError;

      if (propertyData && propertyData.length > 0) {
        const propertyIds = propertyData.map((p) => p.id);
        query = query.in("property_id", propertyIds);
      } else {
        // No properties found, return empty array
        return [];
      }
    } else if (userRole === "tenant") {
      // For tenants, we need to:
      // 1. Get properties they have access to
      const { data: accessData, error: accessError } = await supabase
        .from("tenant_property_access")
        .select("property_id")
        .eq("tenant_user_id", userId);

      if (accessError) throw accessError;

      if (accessData && accessData.length > 0) {
        const propertyIds = accessData.map((a) => a.property_id);
        // 2. Get appointments for those properties OR where they are the tenant
        query = query.or(
          `property_id.in.(${propertyIds}),tenant_user_id.eq.${userId}`
        );
      } else {
        // If no property access, only get appointments they created
        query = query.eq("tenant_user_id", userId);
      }
    } else {
      // If no specific role, just get appointments created by this user
      query = query.eq("tenant_user_id", userId);
    }

    const { data, error } = await query.order("preferred_date", {
      ascending: true,
    });

    if (error) throw error;

    // Transform data to ensure it matches our Appointment type
    const normalizedAppointments = (data || []).map(appointment => ({
      ...appointment,
      // Ensure all fields are correctly typed
      status: (appointment.status || 'pending') as Appointment['status'],
      report_summary: appointment.report_summary || null,
      documents_verified: appointment.documents_verified || false,
      // For any other nullable fields, ensure they have appropriate default values
      message: appointment.message || null,
      lessor_notes: appointment.lessor_notes || null,
      tenant_notes: appointment.tenant_notes || null,
    })) as Appointment[];

    return normalizedAppointments;
  } catch (error) {
    return handleServiceError(error, "fetchUserAppointments");
  }
}

/**
 * Get upcoming appointments (next 7 days with confirmed status)
 */
export function getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const now = new Date();
  const nextWeek = addDays(now, 7);
  
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.preferred_date);
    return aptDate >= now && aptDate <= nextWeek && apt.status === "confirmed";
  });
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  update: AppointmentStatusUpdate
): Promise<void> {
  try {
    const { appointmentId, status, notes } = update;
    const { error } = await supabase
      .from("appointments")
      .update({
        status,
        lessor_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (error) throw error;
  } catch (error) {
    handleServiceError(error, "updateAppointmentStatus");
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  appointment: AppointmentCreate
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([{
        ...appointment,
        status: appointment.status || "pending",
        created_at: new Date().toISOString(),
      }])
      .select("id");

    if (error) throw error;
    
    return data?.[0]?.id;
  } catch (error) {
    return handleServiceError(error, "createAppointment");
  }
}

/**
 * Filter appointments by status
 */
export function filterAppointmentsByStatus(
  appointments: Appointment[],
  status: string
): Appointment[] {
  if (!status || status === "all") return appointments;
  return appointments.filter(appointment => appointment.status === status);
}
