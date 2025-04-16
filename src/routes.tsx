
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import InfluencerPage from '@/pages/InfluencerPage';
import BusinessPage from '@/pages/BusinessPage';
import AuthPage from '@/pages/AuthPage';
import NotFound from '@/pages/NotFound';
import CategoriesPage from '@/pages/CategoriesPage';
import BusinessesPage from '@/pages/BusinessesPage';
import ProfilePage from '@/pages/ProfilePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import SubscriptionDetailsPage from '@/pages/SubscriptionDetailsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUploadPage from '@/pages/AdminUploadPage';
import AdminBusinessListingsPage from '@/pages/AdminBusinessListingsPage';
import AdminSubscriptionsPage from '@/pages/AdminSubscriptionsPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminAnalyticsPage from '@/pages/AdminAnalyticsPage';
import AdminDatabasePage from '@/pages/AdminDatabasePage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminMigrationPage from '@/pages/AdminMigrationPage';
import AdminDashboardManagerPage from '@/pages/AdminDashboardManagerPage';
import AdminDashboardSectionsPage from '@/pages/AdminDashboardSectionsPage';
import AdminDashboardServicePage from '@/pages/AdminDashboardServicePage';
import AdminSeedDataPage from '@/pages/AdminSeedDataPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import BusinessDashboardPage from '@/pages/BusinessDashboardPage';
import InfluencerDashboardPage from '@/pages/InfluencerDashboardPage';
import AdminVideosPage from '@/components/admin/videos/AdminVideosPage';
import CategoryDetailsPage from '@/pages/CategoryDetailsPage';
import InfluencersPage from '@/pages/InfluencersPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="influencer" element={<InfluencerPage />} />
        <Route path="business" element={<BusinessPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="influencers" element={<InfluencersPage />} />
        <Route path="category/:categoryName" element={<CategoryDetailsPage />} />
        <Route path="about" element={<div>About Page</div>} />
        
        {/* Protected routes that still use the main Layout */}
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        <Route path="subscription/:packageId" element={<ProtectedRoute><SubscriptionDetailsPage /></ProtectedRoute>} />
      </Route>
      
      {/* Routes without the main Layout - they have their own layouts */}
      {/* Business Dashboard */}
      <Route path="/dashboard/business" element={<ProtectedRoute><BusinessDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/influencer" element={<ProtectedRoute><InfluencerDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><BusinessDashboardPage /></ProtectedRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/upload" element={<ProtectedRoute requireAdmin={true}><AdminUploadPage /></ProtectedRoute>} />
      <Route path="/admin/businesses" element={<ProtectedRoute requireAdmin={true}><AdminBusinessListingsPage /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute requireAdmin={true}><AdminSubscriptionsPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><AdminAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/database" element={<ProtectedRoute requireAdmin={true}><AdminDatabasePage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requireAdmin={true}><AdminSettingsPage /></ProtectedRoute>} />
      <Route path="/admin/migration" element={<ProtectedRoute requireAdmin={true}><AdminMigrationPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard-manager" element={<ProtectedRoute requireAdmin={true}><AdminDashboardManagerPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard-sections" element={<ProtectedRoute requireAdmin={true}><AdminDashboardSectionsPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard-services" element={<ProtectedRoute requireAdmin={true}><AdminDashboardServicePage /></ProtectedRoute>} />
      <Route path="/admin/videos" element={<ProtectedRoute requireAdmin={true}><AdminVideosPage /></ProtectedRoute>} />
      <Route path="/admin/seed" element={<ProtectedRoute requireAdmin={true}><AdminSeedDataPage /></ProtectedRoute>} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
