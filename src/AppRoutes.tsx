import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessPage from './pages/BusinessPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailsPage from './pages/SubscriptionDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBusinessesPage from './pages/AdminBusinessesPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/business/:businessId" element={<BusinessPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SubscriptionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription/details/:packageId?" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SubscriptionDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminUsersPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/businesses" 
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <AdminBusinessesPage />
            </AdminRoute>
          } 
        />
        <Route
          path="/admin/subscriptions"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
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
