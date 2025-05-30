
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
