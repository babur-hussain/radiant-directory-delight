
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';
import { UserRole, hasRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  roles = [] 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin check
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Role-based access check
  if (roles.length > 0 && !roles.some(role => hasRole(user, role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
