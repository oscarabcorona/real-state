import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle, FileText, User, Phone, Mail, Building2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';

interface Appointment {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  documents_verified: boolean;
  report_summary: {
    credit_score: number;
    criminal_status: string;
    eviction_status: string;
    monthly_income: number;
    debt_to_income_ratio: number;
    employment_status: string;
    verification_date: string;
    recommendation: 'strong' | 'moderate' | 'weak';
  } | null;
  lessor_notes: string;
  tenant_notes: string;
  created_at: string;
  properties: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  tenant_user_id: string;
}

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lessorNotes, setLessorNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          properties (
            name,
            address,
            city,
            state
          )
        `);

      // Filter appointments based on user role
      if (user?.role === 'lessor') {
        // First get the property IDs for this lessor
        const { data: propertyData } = await supabase
          .from('properties')
          .select('id')
          .eq('user_id', user.id);

        if (propertyData && propertyData.length > 0) {
          const propertyIds = propertyData.map(p => p.id);
          query = query.in('property_id', propertyIds);
        }
      } else if (user?.role === 'tenant') {
        // For tenants, we need to:
        // 1. Get properties they have access to
        const { data: accessData } = await supabase
          .from('tenant_property_access')
          .select('property_id')
          .eq('tenant_user_id', user.id);

        if (accessData && accessData.length > 0) {
          const propertyIds = accessData.map(a => a.property_id);
          // 2. Get appointments for those properties OR where they are the tenant
          query = query.or(`property_id.in.(${propertyIds}),tenant_user_id.eq.${user.id}`);
        } else {
          // If no property access, only get appointments they created
          query = query.eq('tenant_user_id', user.id);
        }
      }

      const { data, error } = await query.order('preferred_date', { ascending: true });

      if (error) throw error;
      
      const appointments = data || [];
      setAppointments(appointments);

      // Set upcoming appointments (next 7 days)
      const now = new Date();
      const nextWeek = addDays(now, 7);
      const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.preferred_date);
        return aptDate >= now && aptDate <= nextWeek && apt.status === 'confirmed';
      });
      setUpcomingAppointments(upcoming);

    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          lessor_notes: lessorNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const UpcomingAppointments = () => (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Viewings</h2>
      </div>
      <div className="p-6">
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming viewings scheduled</p>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(appointment.preferred_date), 'MMMM d, yyyy')} at {appointment.preferred_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'lessor' ? appointment.name : appointment.properties.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setLessorNotes(appointment.lessor_notes || '');
                    setShowDetailsModal(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const CalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const appointmentsForDay = (date: Date) => {
      return appointments.filter(appointment => 
        isSameDay(new Date(appointment.preferred_date), date)
      );
    };

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {days.map((day, dayIdx) => {
              const dayAppointments = appointmentsForDay(day);
              return (
                <div
                  key={day.toString()}
                  className={`bg-white min-h-[120px] p-2 ${
                    !isSameMonth(day, currentMonth) ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {format(day, 'd')}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayAppointments.map(appointment => (
                      <button
                        key={appointment.id}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setLessorNotes(appointment.lessor_notes || '');
                          setShowDetailsModal(true);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs ${
                          getStatusClass(appointment.status)
                        }`}
                      >
                        <div className="font-medium truncate">
                          {user?.role === 'lessor' ? appointment.name : appointment.properties.name}
                        </div>
                        <div className="text-xs opacity-75">{appointment.preferred_time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const AppointmentDetailsModal = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Viewing Request Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.properties.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applicant</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(selectedAppointment.preferred_date), 'MMMM d, yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="text-sm text-gray-900">{selectedAppointment.preferred_time}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Documents</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedAppointment.documents_verified ? (
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

            {selectedAppointment.message && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Message</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedAppointment.message}
                </p>
              </div>
            )}

            {user?.role === 'lessor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={lessorNotes}
                  onChange={(e) => setLessorNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add any notes about this viewing request..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              {user?.role === 'lessor' && selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
      <UpcomingAppointments />

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Viewing Requests</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-4 w-4 inline-block mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'list'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 inline-block mr-2" />
                List
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No viewing requests</h3>
              <p className="mt-1 text-sm text-gray-500">You have no pending viewing requests.</p>
            </div>
          ) : activeTab === 'calendar' ? (
            <CalendarView />
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Property</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Applicant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Documents</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{appointment.properties.name}</div>
                        <div className="text-gray-500">{appointment.properties.address}</div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900">{appointment.name}</div>
                        <div className="text-gray-500">{appointment.email}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div>{new Date(appointment.preferred_date).toLocaleDateString()}</div>
                        <div>{appointment.preferred_time}</div>
                      </td>
                      <td className="px-3 py-4 text-sm">
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
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setLessorNotes(appointment.lessor_notes || '');
                            setShowDetailsModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && <AppointmentDetailsModal />}
    </div>
  );
}

export { Appointments };