
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { usePopupAd } from './providers/PopupAdProvider';
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';

const AppRoutes: React.FC = () => {
  const { showSubscriptionPopup, setShowSubscriptionPopup } = usePopupAd();
  
  // Use a fallback that has its own Layout (not dependent on Router)
  const fallbackElement = (
    <Layout hideHeader={false} hideFooter={false}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );
  
  return (
    <RouterProvider 
      router={router} 
      fallbackElement={fallbackElement}
    />
  );
};

export default AppRoutes;
