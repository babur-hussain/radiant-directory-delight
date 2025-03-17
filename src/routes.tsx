
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/businesses" element={<BusinessesPage />} />
      <Route path="/business/:id" element={<BusinessPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/influencer" element={<InfluencerPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/details/:packageId" element={<SubscriptionDetailsPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/businesses" element={<AdminBusinessListingsPage />} />
      <Route path="/admin/dashboard-service/:type" element={<AdminDashboardServicePage />} />
      <Route path="/admin/dashboard-manager" element={<AdminDashboardManagerPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
      <Route path="/admin/dashboard-sections" element={<AdminDashboardSectionsPage />} />
      <Route path="/admin/migration" element={<AdminMigrationPage />} />
      <Route path="/admin/database" element={<AdminDatabasePage />} />
      <Route path="/admin/upload" element={<AdminUploadPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin/seed" element={<AdminSeedDataPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/admin/diagnostics" element={<AdminDashboardPage />} /> {/* Using dashboard page for diagnostics */}
      
      {/* User dashboard routes */}
      <Route path="/dashboard/business" element={<BusinessDashboardPage />} />
      <Route path="/dashboard/influencer" element={<InfluencerDashboardPage />} />
      
      {/* Catch all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
