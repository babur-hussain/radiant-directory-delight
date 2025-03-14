
import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { TableBusinessListings } from "@/components/admin/TableBusinessListings";
import { CSVUploader } from "@/components/admin/CSVUploader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getAllBusinesses } from "@/lib/csv-utils";

const AdminBusinessListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [businessCount, setBusinessCount] = useState(getAllBusinesses().length);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tableRef = useRef<any>(null);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel - Business Listings</CardTitle>
            <CardDescription>
              Please sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in as an admin to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // In a real application, you would check if the user has admin permissions
  
  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setIsUploading(false);
    
    if (success) {
      setUploadSuccess(true);
      setUploadError(null);
      setBusinessCount(getAllBusinesses().length);
      toast({
        title: "Upload Successful",
        description: `${count} businesses have been imported successfully.`,
        variant: "default",
      });
      setTimeout(() => {
        setShowUploadDialog(false);
        setUploadSuccess(false);
      }, 2000);
    } else {
      setUploadError(message);
      setUploadSuccess(false);
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setBusinessCount(getAllBusinesses().length);
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Business Listings</h1>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Business Listings</DialogTitle>
                <DialogDescription>
                  Upload a CSV file containing business data. The file should include columns for: Business Name, Category, Address, Review, and Mobile Number.
                </DialogDescription>
              </DialogHeader>
              
              {!uploadSuccess && !isUploading && (
                <CSVUploader 
                  onUploadStart={() => {
                    setIsUploading(true);
                    setUploadError(null);
                  }}
                  onUploadComplete={handleUploadComplete}
                />
              )}
              
              {isUploading && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-center">Uploading and processing your file...</p>
                </div>
              )}
              
              {uploadSuccess && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="mt-4 text-sm text-center">Upload successful! Businesses have been imported.</p>
                </div>
              )}
              
              {uploadError && (
                <div className="bg-destructive/10 p-4 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Error uploading file</p>
                    <p className="text-sm text-destructive/90">{uploadError}</p>
                  </div>
                </div>
              )}
              
              <DialogFooter className="sm:justify-end">
                {!isUploading && !uploadSuccess && (
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Business Listings</CardTitle>
          <CardDescription>
            View and manage all business listings. Total: {businessCount} businesses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableBusinessListings onRefresh={handleRefresh} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBusinessListingsPage;

