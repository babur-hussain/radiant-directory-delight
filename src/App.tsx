
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
    
    // Force app to be ready after a very short delay
    // This ensures we always show content to the user
    const timer = setTimeout(() => {
      console.log("Forcing app ready state");
      setAppReady(true);
    }, 50); // Very short timeout to show content quickly
    
    return () => {
      clearTimeout(timer);
      console.log("App component unmounting");
    };
  }, []);

  // Minimal error boundary rendered here, just in case
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" message="Initializing application..." />
      </div>
    );
  }

  // Wrap the main app rendering in a try/catch to ensure something always renders
  try {
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
                      <Loading size="lg" message="Loading content..." />
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
  } catch (error) {
    console.error("Error rendering App:", error);
    // Fallback rendering if main app fails
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-4">We're experiencing technical difficulties. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Refresh Page
        </button>
      </div>
    );
  }
};

export default App;
