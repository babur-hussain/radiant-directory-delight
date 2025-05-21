import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePopupAd } from "@/providers/PopupAdProvider";
import SubscriptionPopupAd from "@/components/ads/SubscriptionPopupAd";

const AppShell = () => {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  
  return (
    <>
      <Outlet />
      {showSubscriptionPopup && (
        <SubscriptionPopupAd 
          open={showSubscriptionPopup} 
          onOpenChange={setShowSubscriptionPopup} 
        />
      )}
    </>
  );
};

// Loading component for lazy-loaded routes
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// New pages
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage"));

// Existing lazy loaded components
const BusinessesPage = lazy(() => import("@/pages/BusinessesPage"));
const BusinessPage = lazy(() => import("@/pages/BusinessPage"));
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
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <Layout hideHeader={false} hideFooter={false}><NotFound /></Layout>,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Index /> },
          { 
            path: "businesses", 
            element: <Suspense fallback={<LoadingComponent />}><BusinessesPage /></Suspense> 
          },
          { 
            path: "business/:id", 
            element: <Suspense fallback={<LoadingComponent />}><BusinessPage /></Suspense>
          },
          // Route for "Grow as Business" page
          { 
            path: "business", 
            element: <Suspense fallback={<LoadingComponent />}><BusinessPage /></Suspense>
          },
          // Route for "Earn as Influencer" page
          { 
            path: "influencer", 
            element: <Suspense fallback={<LoadingComponent />}><InfluencerPage /></Suspense>
          },
          { 
            path: "categories", 
            element: <Suspense fallback={<LoadingComponent />}><CategoriesPage /></Suspense> 
          },
          { 
            path: "category/:id", 
            element: <Suspense fallback={<LoadingComponent />}><CategoryDetailsPage /></Suspense> 
          },
          { 
            path: "influencers", 
            element: <Suspense fallback={<LoadingComponent />}><InfluencersPage /></Suspense>
          },
          { 
            path: "influencer/:id", 
            element: <Suspense fallback={<LoadingComponent />}><InfluencerPage /></Suspense>
          },
          // New routes
          { 
            path: "blog", 
            element: <Suspense fallback={<LoadingComponent />}><BlogPage /></Suspense>
          },
          { 
            path: "blog/:id", 
            element: <Suspense fallback={<LoadingComponent />}><BlogPostPage /></Suspense>
          },
          { 
            path: "services", 
            element: <Suspense fallback={<LoadingComponent />}><ServicesPage /></Suspense>
          },
          { 
            path: "about", 
            element: <Suspense fallback={<LoadingComponent />}><AboutPage /></Suspense>
          },
          { 
            path: "portfolio", 
            element: <Suspense fallback={<LoadingComponent />}><PortfolioPage /></Suspense>
          },
          
          { path: "auth", element: <AuthPage /> },
          { path: "auth/callback", element: <AuthCallbackPage /> },
          { path: "auth/reset-password", element: <PasswordResetPage /> },
          
          {
            path: "profile",
            element: <ProtectedRoute>
              <Suspense fallback={<LoadingComponent />}><ProfilePage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "business-dashboard",
            element: <ProtectedRoute roles={["Business"]}>
              <Suspense fallback={<LoadingComponent />}><BusinessDashboardPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "influencer-dashboard",
            element: <ProtectedRoute roles={["Influencer"]}>
              <Suspense fallback={<LoadingComponent />}><InfluencerDashboardPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "dashboard",
            element: <ProtectedRoute>
              <Navigate to="/profile" replace />
            </ProtectedRoute>
          },
          {
            path: "subscriptions",
            element: <ProtectedRoute>
              <Suspense fallback={<LoadingComponent />}><SubscriptionPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "subscription/:id",
            element: <ProtectedRoute>
              <Suspense fallback={<LoadingComponent />}><SubscriptionDetailsPage /></Suspense>
            </ProtectedRoute>
          },
          
          {
            path: "admin",
            element: <ProtectedRoute roles={["Admin"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          },
          {
            path: "admin/login",
            element: <Suspense fallback={<LoadingComponent />}><AdminLoginPage /></Suspense>
          },
          {
            path: "admin/dashboard",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminDashboardPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/users",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminUsersPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/businesses",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminBusinessListingsPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/subscriptions",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminSubscriptionsPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/upload",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminUploadPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/migration",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminMigrationPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/database",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminDatabasePage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/settings",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminSettingsPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/analytics",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminAnalyticsPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/seed",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminSeedDataPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/dashboard-manager",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminDashboardManagerPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/dashboard-sections",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminDashboardSectionsPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "admin/dashboard-services",
            element: <ProtectedRoute roles={["Admin"]}>
              <Suspense fallback={<LoadingComponent />}><AdminDashboardServicePage /></Suspense>
            </ProtectedRoute>
          },
          // Catch-all route for this path level
          {
            path: "*",
            element: <NotFound />
          }
        ],
      },
      // Catch-all route at the end to handle 404s
      {
        path: "*",
        element: <Layout><NotFound /></Layout>
      }
    ],
  },
]);

export default router;
