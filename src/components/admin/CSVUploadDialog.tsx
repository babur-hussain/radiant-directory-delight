
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CSVUploader from './CSVUploader';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface CSVUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ show, onClose, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadStatus(null);
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    setIsUploading(false);
    setUploadStatus({ success, message, count });
    
    if (success) {
      // Notify parent component about successful upload
      onUploadComplete(success, message, count);
      
      // Close dialog after 2 seconds of showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Import Businesses from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {uploadStatus && (
            <div className={`p-4 rounded-md ${uploadStatus.success ? 'bg-green-50' : 'bg-red-50'} mb-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {uploadStatus.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${uploadStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                    {uploadStatus.success ? 'Upload Successful' : 'Upload Failed'}
                  </h3>
                  <div className={`mt-2 text-sm ${uploadStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                    <p>{uploadStatus.message}</p>
                    {uploadStatus.success && uploadStatus.count && (
                      <p className="mt-1">
                        {uploadStatus.count} {uploadStatus.count === 1 ? 'business' : 'businesses'} imported
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <CSVUploader 
            onUploadStart={handleUploadStart} 
            onUploadComplete={handleUploadComplete} 
          />
          
          {isUploading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Uploading and processing...</span>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900">CSV Format Requirements</h4>
            <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>First row must contain column headers</li>
              <li>Required columns: name, category, address</li>
              <li>Optional columns: description, phone, email, website, rating, reviews, latitude, longitude, featured, image</li>
              <li>Use commas to separate values</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
