
import React from 'react';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { router } from './routes';
import SubscriptionPopupAd from './components/ads/SubscriptionPopupAd';
import { usePopupAd } from './providers/PopupAdProvider';

// This component will be rendered only after the router is initialized
const SubscriptionPopupWrapper = () => {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  // useNavigate is safe to use here since this component is rendered by the router
  return (
    <SubscriptionPopupAd 
      open={showSubscriptionPopup} 
      onOpenChange={setShowSubscriptionPopup} 
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <RouterProvider 
      router={router} 
      fallbackElement={<div>Loading...</div>}
    />
  );
};

export default AppRoutes;
