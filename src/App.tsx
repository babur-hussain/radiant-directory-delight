
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import AppRoutes from '@/routes';
import { useEffect } from 'react';
import { initializeData } from '@/lib/csv-utils';

// Initialize QueryClient for React Query with improved caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  // Detect if we're loading a direct URL
  const currentPath = window.location.pathname;
  
  useEffect(() => {
    console.log("App initializing with path:", currentPath);
    
    // Initialize data immediately
    const initData = async () => {
      try {
        await initializeData();
        console.log("Data initialization complete");
      } catch (err) {
        console.error("Error during data initialization:", err);
      }
    };
    
    initData();
    
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
