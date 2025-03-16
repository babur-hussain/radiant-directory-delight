
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
      <Route path="/subscription/details" element={<SubscriptionDetailsPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard-manager" element={<AdminDashboardManagerPage />} />
      <Route path="/admin/businesses" element={<AdminBusinessListingsPage />} />
      <Route path="/admin/dashboard-service/:type" element={<AdminDashboardServicePage />} />
      <Route path="/admin/diagnostics" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/users" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/subscriptions" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/dashboard-sections" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/migration" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/database" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/upload" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/analytics" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/seed" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      <Route path="/admin/settings" element={<AdminDashboardPage />} /> {/* Temporary fallback */}
      
      {/* User dashboard routes */}
      <Route path="/dashboard/business" element={<BusinessDashboardPage />} />
      <Route path="/dashboard/influencer" element={<InfluencerDashboardPage />} />
      
      {/* Catch all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
