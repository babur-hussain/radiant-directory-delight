
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoriesPage from "./pages/CategoriesPage";
import BusinessesPage from "./pages/BusinessesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionDetailsPage from "./pages/SubscriptionDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminBusinessListingsPage from "./pages/AdminBusinessListingsPage";
import InfluencerPage from "./pages/InfluencerPage";
import BusinessPage from "./pages/BusinessPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import SubscriptionDetails from "./components/subscription/SubscriptionDetails";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// App content that uses auth
const AppContent = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <Header />
      <div className="pt-20"> {/* Add padding to account for fixed header */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription/details" element={<SubscriptionDetailsPage />} />
          <Route path="/subscription/details/:packageId" element={<SubscriptionDetails />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/businesses" element={<AdminBusinessListingsPage />} />
          <Route path="/influencer" element={<InfluencerPage />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
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
