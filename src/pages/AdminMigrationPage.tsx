
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Upload, DownloadCloud } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminMigrationPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Data Migration</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Migration Utility</CardTitle>
            <CardDescription>
              Migrate data between different storage systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Firebase to MongoDB</CardTitle>
                  <CardDescription>
                    Migrate data from Firebase to MongoDB database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full flex items-center justify-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Start Migration
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MongoDB to Firebase</CardTitle>
                  <CardDescription>
                    Migrate data from MongoDB to Firebase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full flex items-center justify-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Start Migration
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export/Import</CardTitle>
                <CardDescription>
                  Export or import data as JSON files
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <DownloadCloud className="h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMigrationPage;
