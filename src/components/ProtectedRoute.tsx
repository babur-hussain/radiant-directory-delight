
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

  useEffect(() => {
    console.log("ProtectedRoute rendered:", {
      path: location.pathname,
      isAuthenticated,
      userRole: user?.role,
      isAdmin: user?.isAdmin,
      loading,
      initialized
    });
  }, [location.pathname, isAuthenticated, user, loading, initialized]);

  // Redirect anonymous users to login page
  if (initialized && !loading && !isAuthenticated) {
    console.log("Redirecting to auth: Not authenticated", location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for required role
  if (initialized && !loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
    console.log("Redirecting to home: Required role not met", {
      required: requiredRole,
      actual: user?.role
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for admin requirement
  if (initialized && !loading && isAuthenticated && adminOnly && !user?.isAdmin) {
    console.log("Redirecting to home: Admin required but user is not admin");
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
  console.log("ProtectedRoute rendering children for", location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
