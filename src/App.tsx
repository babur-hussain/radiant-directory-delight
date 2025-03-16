
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
    
    // Always force app to be ready after a short delay
    setTimeout(() => {
      console.log("Forcing app ready state");
      setAppReady(true);
    }, 200); // Very short timeout to show content quickly
    
    return () => {
      console.log("App component unmounting");
    };
  }, []);

  // Always render a minimal version while loading
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
