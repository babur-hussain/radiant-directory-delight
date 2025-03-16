
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoriesPage from "./pages/CategoriesPage";
import BusinessesPage from "./pages/BusinessesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionDetailsPage from "./pages/SubscriptionDetailsPage";
import SubscriptionDetails from "./components/subscription/SubscriptionDetails";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminBusinessListingsPage from "./pages/AdminBusinessListingsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardServicePage from "./pages/AdminDashboardServicePage";
import InfluencerPage from "./pages/InfluencerPage";
import BusinessPage from "./pages/BusinessPage";
import ProfilePage from "./pages/ProfilePage";
import InfluencerDashboardPage from "./pages/InfluencerDashboardPage";
import BusinessDashboardPage from "./pages/BusinessDashboardPage";
import Header from "./components/Header";
import "./App.css";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// App content that uses auth
const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <Sonner />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription/details" element={<SubscriptionDetailsPage />} />
          <Route path="/subscription/details/:packageId" element={<SubscriptionDetails />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/businesses" element={<AdminBusinessListingsPage />} />
          <Route path="/admin/dashboard-services" element={<AdminDashboardServicePage />} />
          <Route path="/influencer" element={<InfluencerPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/influencer-dashboard/*" element={<InfluencerDashboardPage />} />
          <Route path="/business-dashboard/*" element={<BusinessDashboardPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
