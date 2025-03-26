
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadCloud, AlertCircle } from 'lucide-react';
import CSVUploader from './CSVUploader';

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
            
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Important Instructions:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Business Name is the only required field</li>
                    <li>For the best results, include Category, Address, and Phone</li>
                    <li>Use a comma to separate multiple tags</li>
                    <li>Ratings should be values between 0-5</li>
                  </ul>
                </div>
              </div>
            </div>
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
            <strong>Upload Failed:</strong> {uploadError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
