
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import FeaturedBusinesses from './components/FeaturedBusinesses';
import CategorySection from './components/CategorySection';
import AllCategories from './components/AllCategories';
import TestimonialSection from './components/TestimonialSection';
import CtaSection from './components/CtaSection';
import GetListedForm from './components/GetListedForm';
import SearchResults from './components/SearchResults';
import PartnersSection from './components/PartnersSection';
import AdminLayout from './components/admin/AdminLayout';
import UnauthorizedView from './components/admin/UnauthorizedView';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import ProfilePage from './pages/ProfilePage';
import InfluencersPage from './pages/InfluencersPage';
import SubscriptionPopupAd from './components/ads/SubscriptionPopupAd';
import { PopupAdProvider, usePopupAd } from './providers/PopupAdProvider';

// Root component with providers
function App() {
  return (
    <AuthProvider>
      <PopupAdProvider>
        <AppContent />
      </PopupAdProvider>
    </AuthProvider>
  );
}

// App content with access to contexts
function AppContent() {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isGetListedOpen, setIsGetListedOpen] = useState(false);
  
  const handleResultClick = () => {
    setSearchVisible(false);
  };
  
  const handleSearchClose = () => {
    setSearchVisible(false);
  };
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <FeaturedBusinesses />
                  <CategorySection />
                  <TestimonialSection />
                  <CtaSection />
                  <PartnersSection />
                </>
              }
            />
            <Route path="/categories" element={<AllCategories searchTerm={searchTerm} />} />
            <Route path="/get-listed" element={<GetListedForm isOpen={isGetListedOpen} setIsOpen={setIsGetListedOpen} />} />
            <Route path="/search" element={<SearchResults results={searchResults} isLoading={isSearchLoading} visible={searchVisible} onResultClick={handleResultClick} onClose={handleSearchClose} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/influencers" element={<InfluencersPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    {/* Admin routes will be nested here */}
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedView />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Subscription Popup Ad */}
        <SubscriptionPopupAd 
          open={showSubscriptionPopup} 
          onOpenChange={setShowSubscriptionPopup} 
        />
      </div>
    </Router>
  );
}

export default App;
