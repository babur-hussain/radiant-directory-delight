
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Index from './pages/Index';
import BusinessesPage from './pages/BusinessesPage';
import BusinessPage from './pages/BusinessPage';
import CategoriesPage from './pages/CategoriesPage';
import InfluencerPage from './pages/InfluencerPage';
import NotFound from './pages/NotFound';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBusinessListingsPage from './pages/AdminBusinessListingsPage';
import AdminDashboardServicePage from './pages/AdminDashboardServicePage';
import AdminDashboardManagerPage from './pages/AdminDashboardManagerPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage';
import AdminDashboardSectionsPage from './pages/AdminDashboardSectionsPage';
import AdminMigrationPage from './pages/AdminMigrationPage';
import AdminDatabasePage from './pages/AdminDatabasePage';
import AdminUploadPage from './pages/AdminUploadPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSeedDataPage from './pages/AdminSeedDataPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import InfluencerDashboardPage from './pages/InfluencerDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailsPage from './pages/SubscriptionDetailsPage';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          <Layout>
            <Index />
          </Layout>
        } 
      />
      <Route 
        path="/businesses" 
        element={
          <Layout>
            <BusinessesPage />
          </Layout>
        } 
      />
      <Route 
        path="/business/:id" 
        element={
          <Layout>
            <BusinessPage />
          </Layout>
        } 
      />
      <Route 
        path="/business" 
        element={
          <Layout>
            <BusinessPage />
          </Layout>
        } 
      />
      <Route 
        path="/categories" 
        element={
          <Layout>
            <CategoriesPage />
          </Layout>
        } 
      />
      <Route 
        path="/influencer" 
        element={
          <Layout>
            <InfluencerPage />
          </Layout>
        } 
      />
      
      {/* Auth routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* Profile and subscription routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscription" 
        element={
          <Layout>
            <SubscriptionPage />
          </Layout>
        } 
      />
      <Route 
        path="/subscription/details/:packageId" 
        element={
          <Layout>
            <SubscriptionDetailsPage />
          </Layout>
        } 
      />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/businesses" 
        element={
          <ProtectedRoute adminOnly>
            <AdminBusinessListingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard-service/:type" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardServicePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard-manager" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardManagerPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute adminOnly>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/subscriptions" 
        element={
          <ProtectedRoute adminOnly>
            <AdminSubscriptionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard-sections" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardSectionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/migration" 
        element={
          <ProtectedRoute adminOnly>
            <AdminMigrationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/database" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDatabasePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/upload" 
        element={
          <ProtectedRoute adminOnly>
            <AdminUploadPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute adminOnly>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/seed" 
        element={
          <ProtectedRoute adminOnly>
            <AdminSeedDataPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute adminOnly>
            <AdminSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/diagnostics" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* User dashboard routes */}
      <Route 
        path="/dashboard/business" 
        element={
          <ProtectedRoute requiredRole="Business">
            <BusinessDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/influencer" 
        element={
          <ProtectedRoute requiredRole="Influencer">
            <InfluencerDashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Navigate 
              to="/dashboard/business" 
              replace 
            />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all for 404 */}
      <Route 
        path="*" 
        element={
          <Layout>
            <NotFound />
          </Layout>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
