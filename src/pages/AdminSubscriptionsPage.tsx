
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import { useToast } from '@/hooks/use-toast';

const AdminSubscriptionsPage = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handlePermissionError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    toast({
      title: "Permission Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
        </div>
        
        <SubscriptionPackageManagement 
          onPermissionError={handlePermissionError} 
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
