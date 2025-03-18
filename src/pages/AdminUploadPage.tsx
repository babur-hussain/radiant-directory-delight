
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, DownloadCloud, FileUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminUploadPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CSV Upload</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <DownloadCloud className="h-4 w-4" />
            Download Template
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV Data</CardTitle>
            <CardDescription>
              Import data from CSV files to quickly populate your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
              <div className="flex flex-col items-center">
                <FileUp className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Drag and drop your CSV file here</h3>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>
              View recent upload history and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-6">
              No recent uploads found
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUploadPage;
