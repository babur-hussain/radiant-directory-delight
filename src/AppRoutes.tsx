
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { usePopupAd } from './providers/PopupAdProvider';

const AppRoutes: React.FC = () => {
  // We don't need to use usePopupAd here as it's handled in the routes.tsx file
  
  return (
    <RouterProvider 
      router={router} 
      fallbackElement={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>}
    />
  );
};

export default AppRoutes;
