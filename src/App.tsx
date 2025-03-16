
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider";
import AppRoutes from "./routes";
import Header from "./components/Header";
import "./App.css";
import { Suspense } from "react";
import Loading from "./components/ui/loading";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("Rendering App component");
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
