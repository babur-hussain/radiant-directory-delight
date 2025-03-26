
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, DownloadCloud, FileUp, Check, AlertCircle, Shield } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import CSVUploader from '@/components/admin/CSVUploader';
import CSVUploadDialog from '@/components/admin/CSVUploadDialog';
import { useToast } from '@/hooks/use-toast';
import { initializeData, generateCSVTemplate } from '@/lib/csv-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminUploadPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionError, setPermissionError] = useState(false);
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
        setIsLoading(true);
        await initializeData();
        setIsError(false);
        setPermissionError(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setIsError(true);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setErrorMessage(errorMessage);
        
        // Check if it's a permission error
        if (errorMessage.includes('permission') || errorMessage.includes('security policy')) {
          setPermissionError(true);
          toast({
            title: "Permission Error",
            description: "You don't have permission to access business data.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error loading data",
            description: "There was an error initializing the business data.",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Listen for permission errors
  useEffect(() => {
    const handlePermissionError = (e: CustomEvent) => {
      setPermissionError(true);
      setErrorMessage(e.detail.message);
      toast({
        title: "Permission Error",
        description: "You don't have permission to access business data.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('businessPermissionError', handlePermissionError as EventListener);
    
    return () => {
      window.removeEventListener('businessPermissionError', handlePermissionError as EventListener);
    };
  }, [toast]);

  const handleShowUploadDialog = () => {
    setShowUploadDialog(true);
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setShowUploadDialog(false);
    
    // Check if it's a permission error
    const isPermissionError = message.includes('permission') || message.includes('security policy');
    
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
    } else if (isPermissionError) {
      setPermissionError(true);
      toast({
        title: "Permission Error",
        description: "You don't have permission to add businesses to the database.",
        variant: "destructive",
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
    try {
      // Get CSV template content
      const csvContent = generateCSVTemplate();
      
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
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Download Error",
        description: "There was an error downloading the template.",
        variant: "destructive"
      });
    }
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

  if (isError) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">CSV Upload</h1>
          </div>
          
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertCircle className="mr-2 h-5 w-5" />
                Error Loading Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                There was an error initializing the business data. Please try refreshing the page.
              </p>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                  {errorMessage}
                </p>
              )}
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
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
        
        {permissionError && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>
              You don't have permission to add or view businesses in the database. 
              This feature requires administrative privileges.
            </AlertDescription>
          </Alert>
        )}
        
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
