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
import { useAuth } from "@/hooks/useAuth";
import { getReferralIdFromURL } from "@/utils/referral/referralUtils";

// Fix: Wrap the NotFound component in a Layout when used as errorElement
const NotFoundPage = () => (
  <Layout hideHeader={false} hideFooter={false}>
    <NotFound />
  </Layout>
);

// Loading component for lazy-loaded routes
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Referral redirect component
const ReferralRedirect = () => {
  const referralId = getReferralIdFromURL();
  return <Navigate to={`/auth?tab=signup&ref=${referralId || ''}`} replace />;
};

// New component to route users to the appropriate dashboard based on their role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/profile" replace />;
  }
  
  if (user.role === "Admin" || user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (user.role === "Business") {
    return <Navigate to="/dashboard/business" replace />;
  }
  
  if (user.role === "Influencer") {
    return <Navigate to="/dashboard/influencer" replace />;
  }
  
  return <Navigate to="/profile" replace />;
};

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

// Import the missing page components
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ReferralPage = lazy(() => import("@/pages/ReferralPage"));

const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminBusinessListingsPage = lazy(() => import("@/pages/AdminBusinessListingsPage"));
const AdminInfluencerListingsPage = lazy(() => import("@/pages/AdminInfluencerListingsPage"));
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

// Import PaymentSuccessPage
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const TermsAndConditionsPage = lazy(() => import("@/pages/TermsAndConditionsPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const RefundCancellationPolicyPage = lazy(() => import("@/pages/RefundCancellationPolicyPage"));
const PaymentRetryPage = lazy(() => import("@/pages/PaymentRetryPage"));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <Layout><Outlet /></Layout>,
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
          // Fixed: Route for "Grow as Business" page - direct component loading
          { 
            path: "business", 
            element: <Suspense fallback={<LoadingComponent />}><BusinessPage /></Suspense>
          },
          // Fixed: Route for "Earn as Influencer" page - direct component loading
          { 
            path: "influencer", 
            element: <Suspense fallback={<LoadingComponent />}><InfluencerPage /></Suspense>
          },
          { 
            path: "categories", 
            element: <Suspense fallback={<LoadingComponent />}><CategoriesPage /></Suspense> 
          },
          { 
            path: "category/:categoryName",
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
          { 
            path: "contact", 
            element: <Suspense fallback={<LoadingComponent />}><ContactPage /></Suspense>
          },
          // Add the missing referral route
          { 
            path: "referral", 
            element: <Suspense fallback={<LoadingComponent />}><ReferralPage /></Suspense>
          },
          
          { path: "auth", element: <AuthPage /> },
          { path: "auth/callback", element: <AuthCallbackPage /> },
          { path: "auth/reset-password", element: <PasswordResetPage /> },
          
          // Add PaymentSuccessPage route
          { 
            path: "payment-success", 
            element: <Suspense fallback={<LoadingComponent />}><PaymentSuccessPage /></Suspense>
          },
          // Add PaymentRetryPage route
          { 
            path: "payment-retry", 
            element: <Suspense fallback={<LoadingComponent />}><PaymentRetryPage /></Suspense> 
          },
          
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
          // Fix: Add proper routing for dashboard to direct users to the right dashboard based on their role
          {
            path: "dashboard",
            element: <ProtectedRoute>
              <Suspense fallback={<LoadingComponent />}>
                <DashboardRouter />
              </Suspense>
            </ProtectedRoute>
          },
          {
            path: "dashboard/business",
            element: <ProtectedRoute roles={["Business", "Admin"]}>
              <Suspense fallback={<LoadingComponent />}><BusinessDashboardPage /></Suspense>
            </ProtectedRoute>
          },
          {
            path: "dashboard/influencer",
            element: <ProtectedRoute roles={["Influencer", "Admin"]}>
              <Suspense fallback={<LoadingComponent />}><InfluencerDashboardPage /></Suspense>
            </ProtectedRoute>
          },
          // Add the missing subscription routes
          {
            path: "subscription",
            element: <Suspense fallback={<LoadingComponent />}><SubscriptionPage /></Suspense>
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
          
          // Add explicit referral route
          { path: "register", element: <ReferralRedirect /> },
          { path: "ref/:referralId", element: <ReferralRedirect /> },
          
          // Policy Pages
          { 
            path: "terms-and-conditions", 
            element: <Suspense fallback={<LoadingComponent />}><TermsAndConditionsPage /></Suspense>
          },
          { 
            path: "privacy-policy", 
            element: <Suspense fallback={<LoadingComponent />}><PrivacyPolicyPage /></Suspense>
          },
          { 
            path: "refund-cancellation-policy", 
            element: <Suspense fallback={<LoadingComponent />}><RefundCancellationPolicyPage /></Suspense>
          },
          
          // Catch-all route for this path level
          {
            path: "*",
            element: <Navigate to="/" replace />
          },
        ],
      },
      // Admin routes - these should be outside the main Layout
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
        path: "admin/influencers",
        element: <ProtectedRoute roles={["Admin"]}>
          <Suspense fallback={<LoadingComponent />}><AdminInfluencerListingsPage /></Suspense>
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
      // Catch-all route at the end to handle 404s
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ],
  },
]);

export default router;
