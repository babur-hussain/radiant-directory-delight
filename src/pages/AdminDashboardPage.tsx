
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionManagement from '@/components/admin/subscription/SubscriptionManagement';
import UnauthorizedView from '@/components/admin/UnauthorizedView';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [permissionError, setPermissionError] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (user && !user.isAdmin) {
    return <UnauthorizedView />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionError && (
            <p className="text-red-500">Permission Error: {permissionError.message}</p>
          )}
          <SubscriptionManagement 
            onPermissionError={(error) => setPermissionError(error)}
            dbInitialized={true}
            connectionStatus={"connected" as "connecting" | "connected" | "error" | "offline"}
            onRetryConnection={() => {
              // Optional retry connection logic
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
