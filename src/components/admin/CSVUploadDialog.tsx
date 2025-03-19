
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CSVUploader from './CSVUploader';

interface CSVUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ show, onClose, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (success: boolean, message: string) => {
    setIsUploading(false);
    if (success) {
      onUploadComplete();
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => {
      if (!open && !isUploading) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Businesses from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple businesses at once. The CSV file should contain columns for business name, category, address, phone, etc.
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
