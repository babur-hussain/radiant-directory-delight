
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import AppRoutes from './AppRoutes';
import { Toaster } from '@/components/ui/toaster';

// Create a client with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Root component with providers
function App() {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <PopupAdProvider>
          {/* Temporary Developer Lock Overlay - COMMENTED OUT */}
          {/* 
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: '#ff0000',
                textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                animation: 'glow 2s ease-in-out infinite alternate',
                pointerEvents: 'none'
              }}
            >
              ⚠️ This Website is locked by developer due to incomplete payment ⚠️
            </div>
          </div>
          
          <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
            <AppRoutes />
          </div>
          */}
          
          {/* Normal App Routes */}
          <AppRoutes />
        </PopupAdProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
