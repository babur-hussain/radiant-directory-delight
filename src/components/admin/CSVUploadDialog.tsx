
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadCloud, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CSVUploader from './CSVUploader';
import { generateCSVTemplate } from '@/lib/csv-utils';

interface CSVUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUploadComplete: (success?: boolean, message?: string, count?: number) => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ show, onClose, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadError(null);
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setIsUploading(false);
    if (success) {
      onUploadComplete(success, message, count);
    } else {
      setUploadError(message);
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
      setUploadError("Failed to download template");
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => {
      if (!open && !isUploading) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Import Businesses from CSV</DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleDownloadTemplate}
            >
              <DownloadCloud className="h-4 w-4" />
              Download Template
            </Button>
          </div>
          <DialogDescription>
            <p>Upload a CSV file to import multiple businesses. Only <strong>Business Name</strong> is required, all other fields are optional.</p>
            
            <Alert className="mt-2 bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-700">
                <div className="font-medium mb-1">Important Tips:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Business Name is the only required field</li>
                  <li>The system automatically generates IDs - don't include them</li>
                  <li>Use commas to separate multiple tags</li>
                  <li>Rating should be a number between 0-5</li>
                  <li>Common headers are recognized automatically</li>
                </ul>
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <CSVUploader 
            onUploadStart={handleUploadStart} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>
        
        {isUploading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Processing CSV data...</span>
          </div>
        )}
        
        {uploadError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <strong>Upload Issue:</strong> {uploadError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
