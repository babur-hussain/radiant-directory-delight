
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './hooks/useAuth';
import { PopupAdProvider } from './providers/PopupAdProvider';
import SubscriptionPopupAd from './components/ads/SubscriptionPopupAd';
import { usePopupAd } from './providers/PopupAdProvider';
import AppRoutes from './AppRoutes';

// Create a client
const queryClient = new QueryClient();

// Root component with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupAdProvider>
          <AppContent />
        </PopupAdProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// App content with access to contexts
function AppContent() {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  
  return (
    <>
      <AppRoutes />
      
      {/* Subscription Popup Ad */}
      <SubscriptionPopupAd 
        open={showSubscriptionPopup} 
        onOpenChange={setShowSubscriptionPopup} 
      />
    </>
  );
}

export default App;
