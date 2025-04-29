
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import AppRoutes from './AppRoutes';
import { Toaster } from './components/ui/toast';

// Create a client
const queryClient = new QueryClient();

// Root component with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupAdProvider>
          <AppRoutes />
          <Toaster />
        </PopupAdProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
