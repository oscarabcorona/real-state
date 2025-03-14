import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Building2, ClipboardCheck, FileText, Bell, Settings, LogOut, CreditCard, Home, Search, FileBarChart, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ShortStay Hub</span>
              </div>
            </div>
            {user && (
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex">
        {user && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="mt-5 px-2">
              <Link
                to="/dashboard"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <ClipboardCheck className="mr-3 h-6 w-6 text-gray-500" />
                Dashboard
              </Link>
              {user.role === 'tenant' ? (
                <>
                  <Link
                    to="/dashboard/marketplace"
                    className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
                  >
                    <Search className="mr-3 h-6 w-6 text-gray-500" />
                    Marketplace
                  </Link>
                  <Link
                    to="/dashboard/reports"
                    className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
                  >
                    <FileBarChart className="mr-3 h-6 w-6 text-gray-500" />
                    Reports
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard/properties"
                  className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
                >
                  <Home className="mr-3 h-6 w-6 text-gray-500" />
                  Properties
                </Link>
              )}
              <Link
                to="/dashboard/payments"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <CreditCard className="mr-3 h-6 w-6 text-gray-500" />
                Payments
              </Link>
              <Link
                to="/dashboard/documents"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <FileText className="mr-3 h-6 w-6 text-gray-500" />
                Documents
              </Link>
              <Link
                to="/dashboard/appointments"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <Calendar className="mr-3 h-6 w-6 text-gray-500" />
                Appointments
              </Link>
              <Link
                to="/dashboard/notifications"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <Bell className="mr-3 h-6 w-6 text-gray-500" />
                Notifications
              </Link>
              <Link
                to="/dashboard/settings"
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-900 hover:bg-gray-50"
              >
                <Settings className="mr-3 h-6 w-6 text-gray-500" />
                Settings
              </Link>
            </nav>
          </aside>
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}