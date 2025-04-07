import { useState, useEffect, useMemo } from "react";
import { subDays, parseISO } from "date-fns";
import { AppointmentDetailsSheet } from "@/components/appointments/AppointmentDetailsSheet";
import { FilterDialog } from "./components/FilterDialog";
import { AppointmentFilters } from "./components/FilterDialog";
import { Appointment, RescheduleForm } from "../Calendar/types";
import { Button } from "@/components/ui/button";
import { RescheduleContent } from "./components/RescheduleContent";
import { CancelContent } from "./components/CancelContent";
import { CalendarDays, List } from "lucide-react";
import { AppointmentList } from "./components/AppointmentList";
import { CalendarContainer } from "@/components/ui/calendar";
import { CalendarEvent } from "@/components/ui/calendar/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "../../store/authStore";
import {
  cancelAppointment,
  checkTimeSlotConflicts,
  fetchTenantAppointments,
  generateTimeSlots,
  rescheduleAppointment,
  validateDate,
  validateTime,
} from "../../services/appointmentTenantService";
import { useTranslation } from "react-i18next";

export function AppointmentTenant() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
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
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: "all",
    dateRange: "all",
    propertyName: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (rescheduleForm.date) {
      setTimeSlots(generateTimeSlots(rescheduleForm.date));
    }
  }, [rescheduleForm.date]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filters]);

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === filters.status
      );
    }

    // Filter by date range
    const now = new Date();
    switch (filters.dateRange) {
      case "7days":
        filtered = filtered.filter((appointment) => {
          const appointmentDate = new Date(appointment.preferred_date);
          return appointmentDate >= subDays(now, 7);
        });
        break;
      case "30days":
        filtered = filtered.filter((appointment) => {
          const appointmentDate = new Date(appointment.preferred_date);
          return appointmentDate >= subDays(now, 30);
        });
        break;
      case "90days":
        filtered = filtered.filter((appointment) => {
          const appointmentDate = new Date(appointment.preferred_date);
          return appointmentDate >= subDays(now, 90);
        });
        break;
    }

    // Filter by property name
    if (filters.propertyName) {
      const searchTerm = filters.propertyName.toLowerCase();
      filtered = filtered.filter((appointment) =>
        appointment.properties.name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredAppointments(filtered);
  };

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

  // Convert appointments to calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return filteredAppointments
      .filter(
        (appointment) =>
          appointment &&
          appointment.preferred_date &&
          appointment.preferred_time
      )
      .map((appointment) => {
        try {
          const appointmentDate = appointment.preferred_date;
          const appointmentTime = appointment.preferred_time;

          let startDate: Date;
          try {
            startDate = parseISO(`${appointmentDate}T${appointmentTime}`);
            if (isNaN(startDate.getTime())) {
              throw new Error("Invalid date");
            }
          } catch (error) {
            console.warn(
              `Failed to parse date: ${appointmentDate} ${appointmentTime}`,
              error
            );
            startDate = new Date();
          }

          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);

          let color = "bg-blue-500";
          if (appointment.status === "confirmed") {
            color = "bg-green-500";
          } else if (appointment.status === "cancelled") {
            color = "bg-red-500";
          } else if (appointment.status === "pending") {
            color = "bg-amber-500";
          }

          const propertyTitle = appointment.properties?.name || "Property";
          const propertyAddress =
            appointment.properties?.address || "Address not available";

          return {
            id: appointment.id.toString(),
            title: `Viewing: ${propertyTitle}`,
            start: startDate,
            end: endDate,
            color,
            location: propertyAddress,
            meta: appointment,
          };
        } catch (error) {
          console.error(
            "Error converting appointment to event",
            appointment,
            error
          );
          return null;
        }
      })
      .filter(Boolean) as CalendarEvent[];
  }, [filteredAppointments]);

  const handleEventClick = (event: CalendarEvent) => {
    const appointment = event.meta as Appointment;
    setSelectedAppointment(appointment);
    setShowDetailsSheet(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);
    setTimeError("");

    try {
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

      const result = await rescheduleAppointment(
        selectedAppointment.id,
        rescheduleForm
      );

      if (result.success) {
        await fetchAppointments();
        setShowRescheduleModal(false);
        setShowDetailsSheet(false);
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
        setShowDetailsSheet(false);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("appointmentTenant.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("appointmentTenant.subtitle")}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            {t("appointmentTenant.view.calendar")}
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4 mr-2" />
            {t("appointmentTenant.view.list")}
          </Button>
        </div>
        <FilterDialog currentFilters={filters} onApplyFilters={setFilters} />
      </div>

      {view === "calendar" ? (
        <CalendarContainer
          events={calendarEvents}
          onEventClick={handleEventClick}
        />
      ) : (
        <AppointmentList
          appointments={paginatedAppointments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onAppointmentClick={(appointment) => {
            setSelectedAppointment(appointment);
            setShowDetailsSheet(true);
          }}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailsSheet
          appointment={selectedAppointment}
          userRole="tenant"
          open={showDetailsSheet}
          onClose={() => setShowDetailsSheet(false)}
          onReschedule={() => {
            setShowDetailsSheet(false);
            setShowRescheduleModal(true);
          }}
          onCancel={() => {
            setShowDetailsSheet(false);
            setShowCancelModal(true);
          }}
        />
      )}

      <Sheet open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {t("appointmentTenant.modals.reschedule.title")}
            </SheetTitle>
            <SheetDescription>
              {t("appointmentTenant.modals.reschedule.description")}
            </SheetDescription>
          </SheetHeader>
          <RescheduleContent
            rescheduleForm={rescheduleForm}
            onUpdateForm={setRescheduleForm}
            timeSlots={timeSlots}
            timeError={timeError}
          />
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
            >
              {t("appointmentTenant.modals.reschedule.cancel")}
            </Button>
            <Button onClick={handleReschedule} disabled={processing}>
              {processing
                ? t("appointmentTenant.modals.reschedule.processing")
                : t("appointmentTenant.modals.reschedule.reschedule")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={showCancelModal} onOpenChange={setShowCancelModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {t("appointmentTenant.modals.cancel.title")}
            </SheetTitle>
            <SheetDescription>
              {t("appointmentTenant.modals.cancel.description")}
            </SheetDescription>
          </SheetHeader>
          <CancelContent cancelNote={cancelNote} onUpdateNote={setCancelNote} />
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              {t("appointmentTenant.modals.cancel.back")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={processing}
            >
              {processing
                ? t("appointmentTenant.modals.cancel.processing")
                : t("appointmentTenant.modals.cancel.cancel")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
