
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/providers/AuthProvider';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLoginPage from '@/pages/AdminLoginPage';

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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected routes - add your protected routes here */}
            {/* Example:
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Admin routes - add your admin routes here */}
            {/* Example:
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Role-specific routes - add your role-specific routes here */}
            {/* Example:
            <Route 
              path="/business/dashboard" 
              element={
                <ProtectedRoute requiredRole="Business">
                  <BusinessDashboardPage />
                </ProtectedRoute>
              } 
            /> */}
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
