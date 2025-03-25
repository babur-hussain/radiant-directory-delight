
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, DownloadCloud, FileUp, Check, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import CSVUploader from '@/components/admin/CSVUploader';
import CSVUploadDialog from '@/components/admin/CSVUploadDialog';
import { useToast } from '@/hooks/use-toast';
import { initializeData } from '@/lib/csv-utils';

const AdminUploadPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUploadInfo, setLastUploadInfo] = useState<{
    timestamp: Date;
    success: boolean;
    count: number;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeData();
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleShowUploadDialog = () => {
    setShowUploadDialog(true);
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setShowUploadDialog(false);
    
    setLastUploadInfo({
      timestamp: new Date(),
      success,
      count: count || 0,
      message
    });
    
    if (success) {
      toast({
        title: "Upload Successful",
        description: `Successfully imported ${count} businesses`,
      });
    } else {
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const csvHeader = "Business Name,Category,Address,Mobile Number,Review,Description,Email,Website,Tags\n";
    const sampleRow1 = "Acme Coffee Shop,Cafe,123 Main St,555-123-4567,4.5,Best coffee in town,info@acmecoffee.com,https://acmecoffee.com,\"coffee, pastries\"\n";
    const sampleRow2 = "Tech Solutions,Technology,456 Tech Blvd,555-987-6543,5,Professional IT services,contact@techsolutions.com,https://techsolutions.com,\"it, services, computer repair\"\n";
    const csvContent = csvHeader + sampleRow1 + sampleRow2;
    
    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'business_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading upload page...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CSV Upload</h1>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplate}>
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
            <CSVUploader 
              onUploadStart={() => {}} 
              onUploadComplete={handleUploadComplete} 
            />
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
            {lastUploadInfo ? (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  {lastUploadInfo.success ? (
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 rounded-full p-1">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {lastUploadInfo.success ? 'Upload Successful' : 'Upload Failed'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {lastUploadInfo.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm mt-1">
                  {lastUploadInfo.success 
                    ? `Successfully imported ${lastUploadInfo.count} businesses` 
                    : lastUploadInfo.message}
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                No recent uploads found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CSVUploadDialog 
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
    </AdminLayout>
  );
};

export default AdminUploadPage;
