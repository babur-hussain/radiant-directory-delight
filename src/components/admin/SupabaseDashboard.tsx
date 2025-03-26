
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SupabaseSettings from '@/components/admin/supabase/SupabaseSettings';
import SupabaseBusinessesPanel from '@/components/admin/supabase/SupabaseBusinessesPanel';
import SupabaseUsersPanel from '@/components/admin/supabase/SupabaseUsersPanel';
import SupabasePackagesPanel from '@/components/admin/supabase/SupabasePackagesPanel';
import SupabaseDashboardSections from '@/components/admin/supabase/SupabaseDashboardSections';
import SupabaseStatistics from '@/components/admin/supabase/SupabaseStatistics';

const SupabaseDashboard = () => {
  const [activeTab, setActiveTab] = useState('database');
  
  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Dashboard</CardTitle>
          <CardDescription>
            Manage your Supabase database, users, and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Changes made here directly affect the database. Use with caution.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database" className="space-y-4">
              <SupabaseBusinessesPanel />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <SupabaseUsersPanel />
            </TabsContent>
            
            <TabsContent value="packages" className="space-y-4">
              <SupabasePackagesPanel />
            </TabsContent>
            
            <TabsContent value="dashboard" className="space-y-4">
              <SupabaseDashboardSections />
            </TabsContent>
            
            <TabsContent value="statistics" className="space-y-4">
              <SupabaseStatistics />
            </TabsContent>
          </Tabs>
          
        </CardContent>
      </Card>
      
      <SupabaseSettings />
    </div>
  );
};

export default SupabaseDashboard;
