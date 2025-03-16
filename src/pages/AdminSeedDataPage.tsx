
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSeedDataPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Seed Data</h1>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Seeding data may overwrite existing records. Use with caution in production environments.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Generate Seed Data</CardTitle>
            <CardDescription>
              Populate your database with sample data for testing and development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Count:</span>
                    <input 
                      type="number" 
                      className="w-20 p-1 border border-gray-300 rounded text-center" 
                      defaultValue="10" 
                      min="1" 
                      max="100"
                    />
                  </div>
                  <Button className="w-full">Generate Users</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Businesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Count:</span>
                    <input 
                      type="number" 
                      className="w-20 p-1 border border-gray-300 rounded text-center" 
                      defaultValue="25" 
                      min="1" 
                      max="100"
                    />
                  </div>
                  <Button className="w-full">Generate Businesses</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Count:</span>
                    <input 
                      type="number" 
                      className="w-20 p-1 border border-gray-300 rounded text-center" 
                      defaultValue="5" 
                      min="1" 
                      max="20"
                    />
                  </div>
                  <Button className="w-full">Generate Subscriptions</Button>
                </CardContent>
              </Card>
            </div>
            
            <Button className="w-full flex items-center justify-center gap-2">
              <Rocket className="h-4 w-4" />
              Generate All Seed Data
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Reset</CardTitle>
            <CardDescription>
              Clear all data and reset the database to its initial state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
              <Database className="h-4 w-4" />
              Reset Database
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSeedDataPage;
