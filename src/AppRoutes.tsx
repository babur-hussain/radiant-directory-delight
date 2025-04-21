
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import SubscriptionPopupAd from './components/ads/SubscriptionPopupAd';
import { usePopupAd } from './providers/PopupAdProvider';

const AppRoutes: React.FC = () => {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  
  return (
    <>
      <RouterProvider router={router} />
      
      {/* Subscription Popup Ad - Moved to a separate component that will
          only be rendered once the router has been initialized */}
      {router.state && (
        <SubscriptionPopupAd 
          open={showSubscriptionPopup} 
          onOpenChange={setShowSubscriptionPopup} 
        />
      )}
    </>
  );
};

export default AppRoutes;
