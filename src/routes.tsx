import React, { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import BusinessPage from "@/pages/BusinessPage";

const AppShell = () => {
  return <Outlet />;
};

const BusinessesPage = lazy(() => import("@/pages/BusinessesPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const CategoryDetailsPage = lazy(() => import("@/pages/CategoryDetailsPage"));
const InfluencersPage = lazy(() => import("@/pages/InfluencersPage"));
const InfluencerPage = lazy(() => import("@/pages/InfluencerPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

const BusinessDashboardPage = lazy(() => import("@/pages/BusinessDashboardPage"));
const InfluencerDashboardPage = lazy(() => import("@/pages/InfluencerDashboardPage"));

const SubscriptionPage = lazy(() => import("@/pages/SubscriptionPage"));
const SubscriptionDetailsPage = lazy(() => import("@/pages/SubscriptionDetailsPage"));

const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminBusinessListingsPage = lazy(() => import("@/pages/AdminBusinessListingsPage"));
const AdminSubscriptionsPage = lazy(() => import("@/pages/AdminSubscriptionsPage"));
const AdminUploadPage = lazy(() => import("@/pages/AdminUploadPage"));
const AdminMigrationPage = lazy(() => import("@/pages/AdminMigrationPage"));
const AdminDatabasePage = lazy(() => import("@/pages/AdminDatabasePage"));
const AdminSettingsPage = lazy(() => import("@/pages/AdminSettingsPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalyticsPage"));
const AdminSeedDataPage = lazy(() => import("@/pages/AdminSeedDataPage"));
const AdminDashboardManagerPage = lazy(() => import("@/pages/AdminDashboardManagerPage"));
const AdminDashboardSectionsPage = lazy(() => import("@/pages/AdminDashboardSectionsPage"));
const AdminDashboardServicePage = lazy(() => import("@/pages/AdminDashboardServicePage"));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/",
        element: <Layout />,
        errorElement: <NotFound />,
        children: [
          { index: true, element: <Index /> },
          { path: "businesses", element: <BusinessesPage /> },
          { path: "business/:id", element: <BusinessPage /> },
          // Add explicit route for /business that redirects to the BusinessPage
          { path: "business", element: <BusinessPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "category/:id", element: <CategoryDetailsPage /> },
          { path: "influencers", element: <InfluencersPage /> },
          { path: "influencer/:id", element: <InfluencerPage /> },
          { path: "auth", element: <AuthPage /> },
          { path: "auth/callback", element: <AuthCallbackPage /> },
          { path: "auth/reset-password", element: <PasswordResetPage /> },
          
          
          {
            path: "profile",
            element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
          },
          {
            path: "business-dashboard",
            element: <ProtectedRoute roles={["Business"]}><BusinessDashboardPage /></ProtectedRoute>
          },
          {
            path: "influencer-dashboard",
            element: <ProtectedRoute roles={["Influencer"]}><InfluencerDashboardPage /></ProtectedRoute>
          },
          {
            path: "dashboard",
            element: <ProtectedRoute>
              <Navigate to="/profile" replace />
            </ProtectedRoute>
          },
          {
            path: "subscriptions",
            element: <ProtectedRoute><SubscriptionPage /></ProtectedRoute>
          },
          {
            path: "subscription/:id",
            element: <ProtectedRoute><SubscriptionDetailsPage /></ProtectedRoute>
          },
          
          {
            path: "admin",
            element: <ProtectedRoute roles={["Admin"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          },
          {
            path: "admin/dashboard",
            element: <ProtectedRoute roles={["Admin"]}><AdminDashboardPage /></ProtectedRoute>
          },
          {
            path: "admin/users",
            element: <ProtectedRoute roles={["Admin"]}><AdminUsersPage /></ProtectedRoute>
          },
          {
            path: "admin/businesses",
            element: <ProtectedRoute roles={["Admin"]}><AdminBusinessListingsPage /></ProtectedRoute>
          },
          {
            path: "admin/subscriptions",
            element: <ProtectedRoute roles={["Admin"]}><AdminSubscriptionsPage /></ProtectedRoute>
          },
          {
            path: "admin/upload",
            element: <ProtectedRoute roles={["Admin"]}><AdminUploadPage /></ProtectedRoute>
          },
          {
            path: "admin/migration",
            element: <ProtectedRoute roles={["Admin"]}><AdminMigrationPage /></ProtectedRoute>
          },
          {
            path: "admin/database",
            element: <ProtectedRoute roles={["Admin"]}><AdminDatabasePage /></ProtectedRoute>
          },
          {
            path: "admin/settings",
            element: <ProtectedRoute roles={["Admin"]}><AdminSettingsPage /></ProtectedRoute>
          },
          {
            path: "admin/analytics",
            element: <ProtectedRoute roles={["Admin"]}><AdminAnalyticsPage /></ProtectedRoute>
          },
          {
            path: "admin/seed",
            element: <ProtectedRoute roles={["Admin"]}><AdminSeedDataPage /></ProtectedRoute>
          },
          {
            path: "admin/dashboard-manager",
            element: <ProtectedRoute roles={["Admin"]}><AdminDashboardManagerPage /></ProtectedRoute>
          },
          {
            path: "admin/dashboard-sections",
            element: <ProtectedRoute roles={["Admin"]}><AdminDashboardSectionsPage /></ProtectedRoute>
          },
          {
            path: "admin/dashboard-services",
            element: <ProtectedRoute roles={["Admin"]}><AdminDashboardServicePage /></ProtectedRoute>
          },
        ],
      },
    ],
  },
]);

export default router;
