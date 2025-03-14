
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CSVUploader } from './CSVUploader';

export interface CSVUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({
  show,
  onClose,
  onUploadComplete
}) => {
  const handleUploadStart = () => {
    // Any pre-upload logic can go here
    console.log("Upload started");
  };

  return (
    <Dialog open={show} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>
        
        <CSVUploader 
          onUploadStart={handleUploadStart}
          onUploadComplete={onUploadComplete} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
