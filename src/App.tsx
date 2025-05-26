
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import AppRoutes from './AppRoutes';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from './components/Header';
import Index from './pages/Index';
import BusinessesPage from './pages/BusinessesPage';
import InfluencersPage from './pages/InfluencersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ReferralPage from './pages/ReferralPage';
import SubscriptionPage from './pages/SubscriptionPage';
import VideoSubmissionPage from './pages/VideoSubmissionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBusinessListingsPage from './pages/AdminBusinessListingsPage';
import AdminInfluencerListingsPage from './pages/AdminInfluencerListingsPage';
import AdminUploadPage from './pages/AdminUploadPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Root component with providers
function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/businesses" element={<BusinessesPage />} />
                <Route path="/influencers" element={<InfluencersPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/referral" element={<ReferralPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/submit-video" element={<VideoSubmissionPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/businesses" element={<AdminBusinessListingsPage />} />
                <Route path="/admin/influencers" element={<AdminInfluencerListingsPage />} />
                <Route path="/admin/upload" element={<AdminUploadPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
