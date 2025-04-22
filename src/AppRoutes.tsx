
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { usePopupAd } from './providers/PopupAdProvider';

const AppRoutes: React.FC = () => {
  return (
    <RouterProvider 
      router={router} 
      fallbackElement={<div>Loading...</div>}
    />
  );
};

export default AppRoutes;
