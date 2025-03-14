import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CreditCard, FileText, Clock, CheckCircle, AlertCircle, Home, Calendar, MapPin, DollarSign, Bell, ArrowRight, Bed, Bath, User, FileBarChart, Shield, Plus, BarChart, Users, Percent, TrendingUp, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  compliance_status: string;
  property_leases?: {
    tenant: {
      name: string;
    };
  }[];
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  properties: {
    name: string;
  } | null;
}

export function DashboardLessor() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    occupancyRate: 0,
    propertiesCount: 0,
    tenantsCount: 0,
    complianceRate: 0,
    upcomingViewings: 0,
    documentsToReview: 0
  });
  const [revenueChart, setRevenueChart] = useState({
    labels: [] as string[],
    data: [] as number[]
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch properties with tenant info
      const { data: propertiesData } = await supabase
        .from('properties')
        .select(`
          *,
          property_leases (
            tenant:tenants (
              name
            )
          )
        `)
        .eq('user_id', user?.id);

      setProperties(propertiesData || []);

      // Calculate property stats
      const totalProperties = propertiesData?.length || 0;
      const occupiedProperties = propertiesData?.filter(p => 
        p.property_leases && p.property_leases.length > 0
      ).length || 0;
      const compliantProperties = propertiesData?.filter(p => 
        p.compliance_status === 'compliant'
      ).length || 0;

      // Fetch recent payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          properties:property_id (name)
        `)
        .in('property_id', propertiesData?.map(p => p.id) || [])
        .order('created_at', { ascending: false })
        .limit(5);

      setPayments(paymentsData || []);

      // Calculate payment stats
      const totalRevenue = paymentsData
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingAmount = paymentsData
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      // Calculate monthly revenue for chart
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .in('property_id', propertiesData?.map(p => p.id) || [])
        .eq('status', 'completed')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const dailyRevenue = new Map<string, number>();
      monthlyPayments?.forEach(payment => {
        const date = format(new Date(payment.created_at), 'MMM d');
        dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + payment.amount);
      });

      setRevenueChart({
        labels: Array.from(dailyRevenue.keys()),
        data: Array.from(dailyRevenue.values())
      });

      // Update all stats
      setStats({
        totalRevenue,
        pendingPayments: pendingAmount,
        occupancyRate: totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0,
        propertiesCount: totalProperties,
        tenantsCount: occupiedProperties,
        complianceRate: totalProperties > 0 ? (compliantProperties / totalProperties) * 100 : 0,
        upcomingViewings: 0,
        documentsToReview: 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalRevenue.toLocaleString()}
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
                <Percent className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Occupancy Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.occupancyRate.toFixed(1)}%
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
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tenants
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.tenantsCount}
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
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Compliance Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.complianceRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Monthly Revenue</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {format(new Date(), 'MMMM yyyy')}
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-2">
            {revenueChart.data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-indigo-100 rounded-t"
                  style={{ 
                    height: `${(value / Math.max(...revenueChart.data)) * 100}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                  {revenueChart.labels[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Properties Overview</h2>
            <Link
              to="/dashboard/properties"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 3).map((property) => (
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
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.compliance_status === 'compliant'
                        ? 'bg-green-100 text-green-800'
                        : property.compliance_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.compliance_status}
                    </span>
                  </div>
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
                  {property.property_leases && property.property_leases.length > 0 && property.property_leases[0].tenant ? (
                    <div className="mt-4 text-sm text-gray-500">
                      <User className="h-4 w-4 inline mr-1" />
                      Tenant: {property.property_leases[0].tenant.name}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-yellow-500">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Vacant
                    </div>
                  )}
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
            {payments.map((payment) => (
              <div key={payment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(payment.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {payment.properties?.name || 'Unknown Property'}
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
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link
              to="/dashboard/properties/new"
              className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <Building2 className="h-6 w-6 text-indigo-600 mr-3" />
              Add Property
            </Link>
            <Link
              to="/dashboard/payments"
              className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
              View Payments
            </Link>
            <Link
              to="/dashboard/documents"
              className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FileText className="h-6 w-6 text-indigo-600 mr-3" />
              Documents
            </Link>
            <Link
              to="/dashboard/notifications"
              className="flex items-center p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <Bell className="h-6 w-6 text-indigo-600 mr-3" />
              Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}