import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/admin/SubscriptionManagementPage'));
const ContentManagementPage = lazy(() => import('./pages/admin/ContentManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const SubscriptionCheckoutPage = lazy(() => import('./pages/SubscriptionCheckoutPage'));
const SubscriptionSuccessPage = lazy(() => import('./pages/SubscriptionSuccessPage'));
const SubscriptionFailurePage = lazy(() => import('./pages/SubscriptionFailurePage'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="auth/reset-password" element={<PasswordResetPage />} />
          
          {/* Protected routes */}
          <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="subscription/checkout/:packageId" element={<ProtectedRoute><SubscriptionCheckoutPage /></ProtectedRoute>} />
          <Route path="subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
          <Route path="subscription/failure" element={<ProtectedRoute><SubscriptionFailurePage /></ProtectedRoute>} />
          <Route path="referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="admin/subscriptions" element={<AdminRoute><SubscriptionManagementPage /></AdminRoute>} />
          <Route path="admin/content" element={<AdminRoute><ContentManagementPage /></AdminRoute>} />
          <Route path="admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
