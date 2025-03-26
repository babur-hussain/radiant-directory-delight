import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ListFilter, Package, Users } from 'lucide-react';

// Import with named import, not default import
import { SupabaseBusinessesPanel } from '@/components/admin/supabase/SupabaseBusinessesPanel';
import { SupabaseUsersPanel } from '@/components/admin/supabase/SupabaseUsersPanel';
import { SupabasePackagesPanel } from '@/components/admin/supabase/SupabasePackagesPanel';
import { SupabaseDashboardSections } from '@/components/admin/supabase/SupabaseDashboardSections';
import { SupabaseStatistics } from '@/components/admin/supabase/SupabaseStatistics';

const SupabaseDashboard = () => {
  const [activeTab, setActiveTab] = useState('businesses');
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Dashboard</CardTitle>
          <CardDescription>Manage your data directly from Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="businesses" onClick={() => setActiveTab('businesses')}>
                <ListFilter className="mr-2 h-4 w-4" />
                Businesses
              </TabsTrigger>
              <TabsTrigger value="users" onClick={() => setActiveTab('users')}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="packages" onClick={() => setActiveTab('packages')}>
                <Package className="mr-2 h-4 w-4" />
                Packages
              </TabsTrigger>
              <TabsTrigger value="statistics" onClick={() => setActiveTab('statistics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="businesses" className="mt-4">
              <SupabaseBusinessesPanel />
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <SupabaseUsersPanel />
            </TabsContent>
            <TabsContent value="packages" className="mt-4">
              <SupabasePackagesPanel />
            </TabsContent>
            <TabsContent value="sections" className="mt-4">
              <SupabaseDashboardSections />
            </TabsContent>
            <TabsContent value="statistics" className="mt-4">
              <SupabaseStatistics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDashboard;
