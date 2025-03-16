
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, Play, Trash } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDatabasePage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Connection
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Connection</CardTitle>
            <CardDescription>
              Manage your MongoDB database connection and collections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Connected</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                Initialize Database
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Database className="h-4 w-4" />
                View Collections
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600">
                <Trash className="h-4 w-4" />
                Reset Database
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>
              Database collections and document counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">Users</div>
                  <div className="text-sm text-gray-500">Collection</div>
                  <div className="mt-2 text-lg">42 documents</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">Businesses</div>
                  <div className="text-sm text-gray-500">Collection</div>
                  <div className="mt-2 text-lg">156 documents</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">Subscriptions</div>
                  <div className="text-sm text-gray-500">Collection</div>
                  <div className="mt-2 text-lg">24 documents</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDatabasePage;
