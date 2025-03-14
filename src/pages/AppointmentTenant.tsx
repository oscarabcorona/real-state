import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Clock, Filter, ChevronDown, FileText, Download, X, Calendar, ChevronLeft, ChevronRight, MapPin, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, isBefore, parseISO, set, addDays } from 'date-fns';

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

interface RescheduleForm {
  date: string;
  time: string;
  note: string;
}

const VIEWING_RULES = {
  startTime: '09:00',
  endTime: '17:00',
  duration: 60,
  daysInAdvance: 30,
  minNotice: 24,
  excludeDays: [0, 6]
};

export function AppointmentTenant() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: '',
    time: '',
    note: ''
  });
  const [cancelNote, setCancelNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    if (rescheduleForm.date) {
      setTimeSlots(generateTimeSlots(rescheduleForm.date));
    }
  }, [rescheduleForm.date]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          properties (
            name,
            address,
            city,
            state
          )
        `)
        .or(`tenant_user_id.eq.${user?.id},email.eq.${user?.email}`);

      if (error) throw error;
      
      const appointments = data || [];
      setAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (selectedDate: string) => {
    const slots: string[] = [];
    const date = new Date(selectedDate);
    
    if (isBefore(date, new Date()) || VIEWING_RULES.excludeDays.includes(date.getDay())) {
      return slots;
    }

    let currentTime = set(date, {
      hours: parseInt(VIEWING_RULES.startTime.split(':')[0]),
      minutes: parseInt(VIEWING_RULES.startTime.split(':')[1]),
      seconds: 0,
      milliseconds: 0
    });

    const endTime = set(date, {
      hours: parseInt(VIEWING_RULES.endTime.split(':')[0]),
      minutes: parseInt(VIEWING_RULES.endTime.split(':')[1]),
      seconds: 0,
      milliseconds: 0
    });

    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = new Date(currentTime.getTime() + VIEWING_RULES.duration * 60000);
    }

    return slots;
  };

  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + VIEWING_RULES.daysInAdvance);

    if (isBefore(selectedDate, now)) {
      setTimeError('Please select a future date');
      return false;
    }

    if (isAfter(selectedDate, maxDate)) {
      setTimeError(`Appointments can only be scheduled up to ${VIEWING_RULES.daysInAdvance} days in advance`);
      return false;
    }

    if (VIEWING_RULES.excludeDays.includes(selectedDate.getDay())) {
      setTimeError('Appointments are not available on weekends');
      return false;
    }

    return true;
  };

  const validateTime = (date: string, time: string): boolean => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const minDateTime = new Date(now.getTime() + VIEWING_RULES.minNotice * 60 * 60 * 1000);

    if (isBefore(selectedDateTime, minDateTime)) {
      setTimeError(`Please select a time at least ${VIEWING_RULES.minNotice} hours in advance`);
      return false;
    }

    return true;
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    
    if (!validateDate(rescheduleForm.date)) {
      return;
    }

    if (!validateTime(rescheduleForm.date, rescheduleForm.time)) {
      return;
    }

    setProcessing(true);
    setTimeError('');

    try {
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('property_id', selectedAppointment.property_id)
        .eq('preferred_date', rescheduleForm.date)
        .eq('preferred_time', rescheduleForm.time)
        .neq('id', selectedAppointment.id)
        .eq('status', 'confirmed');

      if (conflicts && conflicts.length > 0) {
        setTimeError('This time slot is already booked. Please select another time.');
        setProcessing(false);
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({
          preferred_date: rescheduleForm.date,
          preferred_time: rescheduleForm.time,
          tenant_notes: rescheduleForm.note,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      await fetchAppointments();
      setShowRescheduleModal(false);
      setShowDetailsModal(false);
      setRescheduleForm({ date: '', time: '', note: '' });
      alert('Viewing request rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule viewing request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          tenant_notes: cancelNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      await fetchAppointments();
      setShowCancelModal(false);
      setShowDetailsModal(false);
      setCancelNote('');
      alert('Viewing request cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel viewing request');
    } finally {
      setProcessing(false);
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Viewings</h2>
        </div>
        <div className="p-6">
          {appointments.filter(apt => {
            const aptDate = new Date(apt.preferred_date);
            const now = new Date();
            const nextWeek = addDays(now, 7);
            return aptDate >= now && aptDate <= nextWeek && apt.status === 'confirmed';
          }).length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming viewings scheduled</p>
          ) : (
            <div className="space-y-4">
              {appointments
                .filter(apt => {
                  const aptDate = new Date(apt.preferred_date);
                  const now = new Date();
                  const nextWeek = addDays(now, 7);
                  return aptDate >= now && aptDate <= nextWeek && apt.status === 'confirmed';
                })
                .map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(appointment.preferred_date), 'MMMM d, yyyy')} at {appointment.preferred_time}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.properties.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
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

      {/* Main Appointments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        </div>

        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't scheduled any viewings yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Property</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
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
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div>{new Date(appointment.preferred_date).toLocaleDateString()}</div>
                        <div>{appointment.preferred_time}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getStatusText(appointment.status)}</span>
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          {appointment.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowRescheduleModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowCancelModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Appointment Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Property</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedAppointment.properties.name}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.properties.address}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Date & Time</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedAppointment.preferred_date).toLocaleDateString()} at {selectedAppointment.preferred_time}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1">{getStatusText(selectedAppointment.status)}</span>
                    </span>
                  </div>
                </div>

                {selectedAppointment.message && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Your Message</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.message}</p>
                  </div>
                )}

                {selectedAppointment.lessor_notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Property Manager Notes</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.lessor_notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedAppointment.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowRescheduleModal(true);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Reschedule Viewing</h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Date</label>
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) => {
                      const date = e.target.value;
                      setRescheduleForm({ ...rescheduleForm, date, time: '' });
                      setTimeError('');
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + VIEWING_RULES.daysInAdvance * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Viewings available Monday-Friday, up to {VIEWING_RULES.daysInAdvance} days in advance
                  </p>
                </div>

                {rescheduleForm.date && timeSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Time</label>
                    <select
                      value={rescheduleForm.time}
                      onChange={(e) => {
                        setRescheduleForm({ ...rescheduleForm, time: e.target.value });
                        setTimeError('');
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {VIEWING_RULES.duration} minute viewing slots between {VIEWING_RULES.startTime} and {VIEWING_RULES.endTime}
                    </p>
                  </div>
                )}

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
                  <label className="block text-sm font-medium text-gray-700">Note for Property Manager</label>
                  <textarea
                    value={rescheduleForm.note}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, note: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Please explain why you need to reschedule..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={processing || !rescheduleForm.date || !rescheduleForm.time || !rescheduleForm.note}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Cancel Viewing</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to cancel this viewing? This action cannot be undone.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Note for Property Manager</label>
                  <textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Please explain why you're cancelling..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={processing || !cancelNote}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}