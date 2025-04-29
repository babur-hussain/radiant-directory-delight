
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import AppRoutes from './AppRoutes';
import { Toaster } from './components/ui/toaster';

// Create a client
const queryClient = new QueryClient();

// Root component with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PopupAdProvider>
            <AppRoutes />
            <Toaster />
          </PopupAdProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
