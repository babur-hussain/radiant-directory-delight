
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import CSVUploader from './CSVUploader';

interface CSVUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUploadComplete: (success?: boolean, message?: string, count?: number) => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ show, onClose, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setIsUploading(false);
    if (success) {
      onUploadComplete(success, message, count);
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
            Upload a CSV file to import multiple businesses at once. The file should contain columns for Business Name, Category, Address, Mobile Number, and Review rating.
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
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
