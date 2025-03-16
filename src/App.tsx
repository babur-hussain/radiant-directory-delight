
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider";
import AppRoutes from "./routes";
import Header from "./components/Header";
import "./App.css";
import { Suspense, useEffect, useState } from "react";
import Loading from "./components/ui/loading";

// Create a new QueryClient instance with more lenient settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000, // Data considered fresh for 10 seconds
    },
  },
});

const App = () => {
  console.log("Rendering App component");
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    console.log("App component mounted");
    // Check if there are any visible elements
    const appElement = document.getElementById('root');
    if (appElement) {
      console.log("Root element exists with dimensions:", 
        appElement.offsetWidth, "x", appElement.offsetHeight);
    }
    
    // Add a timeout to ensure we always set the app as ready
    const readyTimeout = setTimeout(() => {
      console.log("App ready timeout reached, showing UI anyway");
      setAppReady(true);
    }, 500);
    
    // Set app as ready immediately if it's not a direct page load
    if (document.readyState === 'complete' || performance.navigation.type !== 0) {
      console.log("App ready - not a direct page load");
      setAppReady(true);
    }
    
    return () => clearTimeout(readyTimeout);
  }, []);

  // Add a safety check to ensure we always render something
  if (!appReady && document.body.innerHTML === '') {
    console.log("Forcing minimal content while app prepares");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="Loading application..." />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="relative min-h-screen bg-background">
              <Header />
              <main className="min-h-[50vh]">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[80vh]">
                    <Loading size="lg" message="Loading page..." />
                  </div>
                }>
                  <AppRoutes />
                </Suspense>
              </main>
              <Toaster />
              <Sonner />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
