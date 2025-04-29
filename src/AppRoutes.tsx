
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import SubscriptionPopupAd from './components/ads/SubscriptionPopupAd';
import { usePopupAd } from './providers/PopupAdProvider';

const AppRoutes: React.FC = () => {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  
  return (
    <>
      <RouterProvider 
        router={router} 
        fallbackElement={<div>Loading...</div>}
      />
      {showSubscriptionPopup && (
        <SubscriptionPopupAd 
          open={showSubscriptionPopup} 
          onOpenChange={setShowSubscriptionPopup} 
        />
      )}
    </>
  );
};

export default AppRoutes;
