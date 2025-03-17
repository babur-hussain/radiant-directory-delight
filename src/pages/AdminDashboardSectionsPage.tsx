
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, RefreshCw, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboardTabs from '@/components/admin/dashboard/AdminDashboardTabs';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardSectionsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Dashboard sections data has been refreshed",
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-full">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Dashboard Sections</h1>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        
        <Card className="bg-card border shadow-sm">
          <CardHeader>
            <CardTitle>Dashboard Section Management</CardTitle>
            <CardDescription>
              Configure and manage dashboard sections for different user types and subscription packages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <AdminDashboardTabs />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardSectionsPage;
