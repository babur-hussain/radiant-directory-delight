
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import AppRoutes from '@/routes';
import { useEffect } from 'react';

// Initialize QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Detect if we're loading a direct URL
  const currentPath = window.location.pathname;
  
  useEffect(() => {
    console.log("App initializing with path:", currentPath);
    console.log("Full URL:", window.location.href);
    console.log("Origin:", window.location.origin);
    console.log("Host:", window.location.host);
    
    // Force a one-time check of the routing system
    const routeCheck = setTimeout(() => {
      console.log("Route system initialized");
    }, 100);
    
    return () => clearTimeout(routeCheck);
  }, [currentPath]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
