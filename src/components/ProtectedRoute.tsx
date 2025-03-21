
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  adminOnly = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading, initialized } = useAuth();
  const location = useLocation();

  // Redirect anonymous users to login page
  if (initialized && !loading && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for required role
  if (initialized && !loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for admin requirement
  if (initialized && !loading && isAuthenticated && adminOnly && !user?.isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Show loading indicator while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  // If everything is good, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
