
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CSVUploader } from "@/components/admin/CSVUploader";
import { Upload, AlertTriangle, Check } from 'lucide-react';

interface CSVUploadDialogProps {
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({
  showUploadDialog,
  setShowUploadDialog,
  handleUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    console.log("CSVUploadDialog render", { showUploadDialog });
  }, [showUploadDialog]);

  const handleDialogChange = (open: boolean) => {
    console.log("Dialog change", { open, current: showUploadDialog });
    setShowUploadDialog(open);
    if (!open) {
      setUploadSuccess(false);
      setUploadError(null);
    }
  };

  return (
    <Dialog 
      open={showUploadDialog} 
      onOpenChange={handleDialogChange}
    >
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
            onUploadComplete={(success, message, count) => {
              setIsUploading(false);
              
              if (success) {
                setUploadSuccess(true);
                setUploadError(null);
                
                setTimeout(() => {
                  setShowUploadDialog(false);
                  setUploadSuccess(false);
                }, 2000);
              } else {
                setUploadError(message);
                setUploadSuccess(false);
              }
              
              handleUploadComplete(success, message, count);
            }}
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
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
              type="button"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
