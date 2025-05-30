
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import BusinessPage from './pages/BusinessPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailsPage from './pages/SubscriptionDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBusinessesPage from './pages/AdminBusinessesPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/business/:businessId" element={<BusinessPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription/details/:packageId?" 
          element={
            <ProtectedRoute>
              <SubscriptionDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/businesses" 
          element={
            <AdminRoute>
              <AdminBusinessesPage />
            </AdminRoute>
          } 
        />
        <Route
          path="/admin/subscriptions"
          element={
            <AdminRoute>
              <AdminSubscriptionsPage />
            </AdminRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
