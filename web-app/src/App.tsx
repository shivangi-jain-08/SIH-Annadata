import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { LocationProvider } from '@/components/location/LocationProvider';

// Pages
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Dashboard pages
import { FarmerRoutes } from '@/pages/dashboard/FarmerRoutes';
import { VendorRoutes } from '@/pages/dashboard/VendorRoutes';
import { ConsumerDashboard } from '@/pages/dashboard/ConsumerDashboard';

// Demo pages
import ConsumerMapDemo from '@/pages/ConsumerMapDemo';

// Placeholder pages with proper styling
const About = () => (
  <div className="container mx-auto px-4 py-16 max-w-4xl">
    <h1 className="text-3xl font-bold mb-6">About Annadata</h1>
    <p className="text-lg text-muted-foreground">
      Learn more about our mission to transform agriculture through technology and innovation.
    </p>
  </div>
);

const Contact = () => (
  <div className="container mx-auto px-4 py-16 max-w-4xl">
    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
    <p className="text-lg text-muted-foreground">
      Get in touch with our team for support and inquiries.
    </p>
  </div>
);

const Marketplace = () => (
  <div className="container mx-auto px-4 py-16 max-w-4xl">
    <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
    <p className="text-lg text-muted-foreground">
      Browse products from farmers and vendors across the platform.
    </p>
  </div>
);

function App() {
  return (
    <div className="dashboard-container">
      <AuthProvider>
        <WebSocketProvider>
          <LocationProvider>
            <Router>
              <NotificationManager />
              <Toaster position="top-right" richColors />
              <Routes>
                {/* Public routes with AppLayout */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Landing />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="vendor-nudge-demo" element={<ConsumerMapDemo />} />
                </Route>

                {/* Auth routes (no layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected dashboard routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Farmer routes */}
                  <Route
                    path="farmer/*"
                    element={
                      <ProtectedRoute requiredRole="farmer">
                        <FarmerRoutes />
                      </ProtectedRoute>
                    }
                  />

                  {/* Vendor routes */}
                  <Route
                    path="vendor/*"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <VendorRoutes />
                      </ProtectedRoute>
                    }
                  />

                  {/* Consumer routes */}
                  <Route
                    path="consumer"
                    element={
                      <ProtectedRoute requiredRole="consumer">
                        <ConsumerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="consumer/*"
                    element={
                      <ProtectedRoute requiredRole="consumer">
                        <ConsumerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Default dashboard redirect based on user role */}
                  <Route index element={<Navigate to="/dashboard/vendor" replace />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </LocationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;