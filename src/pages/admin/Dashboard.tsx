
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatabaseMigrationPanel from '@/components/admin/DatabaseMigrationPanel';
import MongoDBInitializationPanel from '@/components/admin/MongoDBInitializationPanel';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="setup">MongoDB Setup</TabsTrigger>
          <TabsTrigger value="migration">Data Migration</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>MongoDB Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <MongoDBInitializationPanel />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="migration" className="space-y-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Firestore to MongoDB Migration</CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseMigrationPanel />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Dashboard Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Statistics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
