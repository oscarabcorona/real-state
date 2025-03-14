import { addDays, isAfter, isBefore } from "date-fns";
import {
  AlertCircle,
  Bath,
  Bed,
  Building2,
  Calendar,
  MapPin,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { VIEWING_RULES } from "./const";
import { Header } from "./Header";
import type { AppointmentForm, Property } from "./types";
import { Filters } from "./Filters";

export function Marketplace() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    city: "",
    state: "",
  });
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [timeError, setTimeError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select(
          `
          *,
          users (
            email
          )
        `
        )
        .eq("published", true);

      if (filters.type) {
        query = query.eq("property_type", filters.type);
      }
      if (filters.minPrice) {
        query = query.gte("price", parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte("price", parseFloat(filters.maxPrice));
      }
      if (filters.bedrooms) {
        query = query.eq("bedrooms", parseInt(filters.bedrooms));
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.state) {
        query = query.ilike("state", `%${filters.state}%`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateAppointmentTime = (date: string, time: string): boolean => {
    if (!date || !time) {
      setTimeError("Please select both date and time");
      return false;
    }

    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const minDateTime = new Date(
      now.getTime() + VIEWING_RULES.minNotice * 60 * 60 * 1000
    );
    const maxDateTime = addDays(now, VIEWING_RULES.daysInAdvance);

    if (isBefore(appointmentDateTime, minDateTime)) {
      setTimeError(
        `Please select a time at least ${VIEWING_RULES.minNotice} hours in advance`
      );
      return false;
    }

    if (isAfter(appointmentDateTime, maxDateTime)) {
      setTimeError(
        `Appointments can only be scheduled up to ${VIEWING_RULES.daysInAdvance} days in advance`
      );
      return false;
    }

    if (VIEWING_RULES.excludeDays.includes(appointmentDateTime.getDay())) {
      setTimeError("Appointments are not available on weekends");
      return false;
    }

    return true;
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setTimeError("");

    // Validate required fields
    if (!appointmentForm.date || !appointmentForm.time) {
      setTimeError("Please select both date and time");
      return;
    }

    setSubmitting(true);

    try {
      if (
        !validateAppointmentTime(appointmentForm.date, appointmentForm.time)
      ) {
        setSubmitting(false);
        return;
      }

      // Format time to HH:mm format
      const timeMatch = appointmentForm.time.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) {
        setTimeError("Invalid time format");
        setSubmitting(false);
        return;
      }

      const [, hours, minutes] = timeMatch;
      const formattedTime = `${hours.padStart(2, "0")}:${minutes}`;

      const { error } = await supabase.from("appointments").insert([
        {
          property_id: selectedProperty.id,
          name: appointmentForm.name,
          email: appointmentForm.email,
          phone: appointmentForm.phone,
          preferred_date: appointmentForm.date,
          preferred_time: formattedTime,
          message: appointmentForm.message,
          status: "pending",
          tenant_user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setShowAppointmentModal(false);
      setAppointmentForm({
        name: user?.full_name || "",
        email: user?.email || "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });
      alert("Viewing request submitted successfully!");
    } catch (error) {
      console.error("Error submitting appointment:", error);
      alert("Failed to submit viewing request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const AppointmentModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Schedule a Viewing</h3>
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleAppointmentSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              required
              value={appointmentForm.name}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={appointmentForm.email}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  email: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              required
              value={appointmentForm.phone}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  phone: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Date
            </label>
            <input
              type="date"
              required
              value={appointmentForm.date}
              onChange={(e) => {
                setAppointmentForm({
                  ...appointmentForm,
                  date: e.target.value,
                  time: "",
                });
                setTimeError("");
              }}
              min={new Date().toISOString().split("T")[0]}
              max={
                addDays(new Date(), VIEWING_RULES.daysInAdvance)
                  .toISOString()
                  .split("T")[0]
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Viewings available Monday-Friday, up to{" "}
              {VIEWING_RULES.daysInAdvance} days in advance
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Time
            </label>
            <input
              type="time"
              required
              value={appointmentForm.time}
              onChange={(e) => {
                setAppointmentForm({
                  ...appointmentForm,
                  time: e.target.value,
                });
                setTimeError("");
              }}
              min={VIEWING_RULES.startTime}
              max={VIEWING_RULES.endTime}
              step="3600"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Available times: {VIEWING_RULES.startTime} -{" "}
              {VIEWING_RULES.endTime}
            </p>
          </div>

          {timeError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{timeError}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              value={appointmentForm.message}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  message: e.target.value,
                })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              "Schedule Viewing"
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      {/* Filters */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
      />

      {/* Property Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No properties found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-transform duration-200 hover:scale-[1.02]"
              >
                <div className="h-48 bg-gray-200 relative">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                      {property.property_type.charAt(0).toUpperCase() +
                        property.property_type.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {property.name}
                    </h3>
                    <span className="text-lg font-bold text-indigo-600">
                      ${property.price.toLocaleString()}/mo
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {property.address}, {property.city}, {property.state}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.square_feet.toLocaleString()} sqft
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowAppointmentModal(true);
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Viewing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAppointmentModal && selectedProperty && <AppointmentModal />}
    </div>
  );
}
