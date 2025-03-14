import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, CreditCard, FileText, Clock, CheckCircle, AlertCircle, Home,
  Calendar, MapPin, DollarSign, Bell, ArrowRight, Bed, Bath, User,
  FileBarChart, Shield, Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { format, addDays } from 'date-fns';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price: number;
  images: string[];
  user_id: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_manager: {
    email: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  properties: {
    name: string;
  };
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  properties: {
    name: string;
  };
}

interface Appointment {
  id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  properties: {
    name: string;
    address: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function DashboardTenant() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pending: 0,
    propertiesCount: 0,
    autoPayActive: 0,
    documentsVerified: 0,
    documentsTotal: 0,
    upcomingViewings: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get property access
      const { data: accessData } = await supabase
        .from('tenant_property_access')
        .select('property_id')
        .eq('tenant_user_id', user?.id);

      if (accessData && accessData.length > 0) {
        const propertyIds = accessData.map(a => a.property_id);

        // Fetch properties
        const { data: propertiesData } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            address,
            city,
            state,
            price,
            images,
            bedrooms,
            bathrooms,
            square_feet,
            user_id,
            property_manager:users!properties_user_id_fkey (
              email
            )
          `)
          .in('id', propertyIds);

        setProperties(propertiesData || []);
        setStats(prev => ({ ...prev, propertiesCount: propertiesData?.length || 0 }));

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            status,
            payment_method,
            created_at,
            properties:property_id (name)
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setPayments(paymentsData || []);

        // Calculate payment stats
        const totalPaid = paymentsData
          ?.filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) || 0;

        const pendingPayments = paymentsData
          ?.filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0) || 0;

        const autoPayActive = paymentsData
          ?.filter(p => p.payment_method === 'ach')
          .length || 0;

        setStats(prev => ({
          ...prev,
          totalPaid,
          pending: pendingPayments,
          autoPayActive
        }));

        // Fetch documents
        const { data: documentsData } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            type,
            status,
            created_at,
            properties:property_id (name)
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setDocuments(documentsData || []);

        // Calculate document stats
        const verifiedDocs = documentsData?.filter(d => d.status === 'signed').length || 0;
        const totalDocs = documentsData?.length || 0;

        setStats(prev => ({
          ...prev,
          documentsVerified: verifiedDocs,
          documentsTotal: totalDocs
        }));

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            id,
            property_id,
            preferred_date,
            preferred_time,
            status,
            properties (
              name,
              address
            )
          `)
          .eq('tenant_user_id', user?.id)
          .gte('preferred_date', new Date().toISOString())
          .order('preferred_date', { ascending: true })
          .limit(5);

        setAppointments(appointmentsData || []);
        setStats(prev => ({
          ...prev,
          upcomingViewings: appointmentsData?.filter(a => a.status === 'confirmed').length || 0
        }));

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If the tenant has no properties, show the marketplace
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Search className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Find Your Next Home</h2>
        <p className="mt-2 text-gray-500">
          Browse available properties and schedule viewings.
        </p>
        <Link
          to="/dashboard/marketplace"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Search className="h-4 w-4 mr-2" />
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rented Properties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.propertiesCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Paid
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalPaid.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documents Verified
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.documentsVerified} / {stats.documentsTotal}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Viewings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.upcomingViewings}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Your Properties</h2>
            <Link
              to="/dashboard/marketplace"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white border rounded-lg overflow-hidden">
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
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {property.address}, {property.city}, {property.state}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-lg font-semibold text-indigo-600">
                      ${property.price.toLocaleString()}/month
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <User className="h-4 w-4 inline mr-1" />
                    Property Manager: {property.property_manager?.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
              <Link
                to="/dashboard/payments"
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No payment history available
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.properties?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
              <Link
                to="/dashboard/documents"
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {documents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No documents available
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {doc.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doc.properties?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(doc.status)}`}>
                        {doc.status}
                      </span>
                      <span className="ml-4 text-sm text-gray-500">
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Viewings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Viewings</h2>
            <Link
              to="/dashboard/appointments"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No upcoming viewings scheduled
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.properties.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.preferred_date), 'MMM d, yyyy')} at {appointment.preferred_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/dashboard/marketplace"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
        >
          <Search className="h-8 w-8 text-indigo-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Find Properties</h3>
          <p className="mt-1 text-sm text-gray-500">Browse available properties</p>
          <div className="mt-4 flex items-center text-indigo-600">
            <span className="text-sm font-medium">Browse Now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/dashboard/documents"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
        >
          <FileBarChart className="h-8 w-8 text-indigo-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Documents</h3>
          <p className="mt-1 text-sm text-gray-500">Submit required documentation</p>
          <div className="mt-4 flex items-center text-indigo-600">
            <span className="text-sm font-medium">Upload Now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/dashboard/payments"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
        >
          <CreditCard className="h-8 w-8 text-indigo-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Make Payment</h3>
          <p className="mt-1 text-sm text-gray-500">Pay rent or schedule auto-pay</p>
          <div className="mt-4 flex items-center text-indigo-600">
            <span className="text-sm font-medium">Pay Now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        <Link
          to="/dashboard/appointments"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
        >
          <Calendar className="h-8 w-8 text-indigo-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Schedule Viewing</h3>
          <p className="mt-1 text-sm text-gray-500">Book property viewings</p>
          <div className="mt-4 flex items-center text-indigo-600">
            <span className="text-sm font-medium">Schedule Now</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}