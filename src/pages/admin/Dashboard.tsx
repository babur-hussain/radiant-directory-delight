import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import UnauthorizedView from '@/components/admin/UnauthorizedView';
import SubscriptionManagement from '@/components/admin/subscription/SubscriptionManagement';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();
  const [permissionError, setPermissionError] = useState<any>(null);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate, initialized]);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <UnauthorizedView />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {permissionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            {permissionError instanceof Error ? permissionError.message : String(permissionError)}
          </AlertDescription>
        </Alert>
      )}

      <SubscriptionManagement 
        onPermissionError={(error) => setPermissionError(error)}
        dbInitialized={true}
        connectionStatus={"connected" as "connecting" | "connected" | "error" | "offline"}
        onRetryConnection={() => {
          // Optional retry connection logic
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
