
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider";
import AppRoutes from "./routes";
import Header from "./components/Header";
import "./App.css";
import { Suspense, useEffect } from "react";
import Loading from "./components/ui/loading";

// Create a new QueryClient with lenient settings for better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
      meta: {
        errorHandler: (error: any) => {
          console.log("Query error:", error);
        }
      }
    },
  },
});

const App = () => {
  // Initialize local storage with demo data if needed
  useEffect(() => {
    // Check if business categories exist in localStorage
    if (!localStorage.getItem("businessCategories")) {
      // Set sample categories
      const sampleCategories = [
        { id: 1, name: "Restaurant" },
        { id: 2, name: "Retail" },
        { id: 3, name: "Technology" },
        { id: 4, name: "Healthcare" },
        { id: 5, name: "Education" }
      ];
      localStorage.setItem("businessCategories", JSON.stringify(sampleCategories));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="relative min-h-screen bg-background">
              <Header />
              <main>
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
};

export default App;
