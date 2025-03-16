
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { connectToMongoDB } from './config/mongodb';
import { initializeMongoDB } from './utils/initMongoDB';

// Initialize MongoDB connection
initializeMongoDB()
  .then(success => {
    console.log('MongoDB initialization result:', success);
  })
  .catch(error => {
    console.error('Error during MongoDB initialization:', error);
  });

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
