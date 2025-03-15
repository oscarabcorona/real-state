import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Documents } from "./pages/Documents";
import { Reports } from "./pages/Reports";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Payments } from "./pages/Payments";
import { PaymentTenant } from "./pages/PaymentTenant";
import { Properties } from "./pages/Properties";
import { PublicProperties } from "./pages/PublicProperties";
import { DashboardTenant } from "./pages/DashboardTenant";
import { DashboardLessor } from "./pages/DashboardLessor";
import { Marketplace } from "./pages/Marketplace";
import { Appointments } from "./pages/Appointments";
import { AppointmentTenant } from "./pages/AppointmentTenant";
import { useAuthStore } from "./store/authStore";
import { ThemeProvider } from "@/components/ui/theme-provider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/properties" element={<PublicProperties />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                user?.role === "tenant" ? (
                  <DashboardTenant />
                ) : (
                  <DashboardLessor />
                )
              }
            />
            <Route path="properties" element={<Properties />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route
              path="payments"
              element={
                user?.role === "tenant" ? <PaymentTenant /> : <Payments />
              }
            />
            <Route path="documents" element={<Documents />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="appointments"
              element={
                user?.role === "tenant" ? (
                  <AppointmentTenant />
                ) : (
                  <Appointments />
                )
              }
            />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
