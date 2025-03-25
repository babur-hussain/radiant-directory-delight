
import React, { useState } from 'react';
import { 
  Users, Package, Database, BarChart, 
  Settings, Upload, FileText, Layout 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import SupabaseUsersPanel from '@/components/admin/supabase/SupabaseUsersPanel';
import SupabasePackagesPanel from '@/components/admin/supabase/SupabasePackagesPanel';
import SupabaseBusinessesPanel from '@/components/admin/supabase/SupabaseBusinessesPanel';
import SupabaseDashboardSections from '@/components/admin/supabase/SupabaseDashboardSections';
import SupabaseStatistics from '@/components/admin/supabase/SupabaseStatistics';
import SupabaseSettings from '@/components/admin/supabase/SupabaseSettings';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/integrations/supabase/client';

const SupabaseDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; error?: string } | null>(null);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsConnecting(true);
    try {
      const status = await testSupabaseConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Supabase",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: status.error || "Could not connect to Supabase",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus({ connected: false, error: String(error) });
      toast({
        title: "Connection Error",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Supabase Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isConnecting}
          >
            {isConnecting ? "Checking..." : "Test Connection"}
          </Button>
        </div>

        {connectionStatus && !connectionStatus.connected && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700">Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{connectionStatus.error || "Could not connect to Supabase"}</p>
            </CardContent>
          </Card>
        )}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">Businesses</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <SupabaseUsersPanel />
          </TabsContent>
          
          <TabsContent value="packages" className="space-y-4">
            <SupabasePackagesPanel />
          </TabsContent>
          
          <TabsContent value="businesses" className="space-y-4">
            <SupabaseBusinessesPanel />
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-4">
            <SupabaseDashboardSections />
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <SupabaseStatistics />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <SupabaseSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SupabaseDashboard;
