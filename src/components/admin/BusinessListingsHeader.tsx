
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import CSVUploadDialog from './CSVUploadDialog';

interface BusinessListingsHeaderProps {
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  handleRefresh: () => void;
  handleAddBusiness: () => void;
  isRefreshing: boolean;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const BusinessListingsHeader: React.FC<BusinessListingsHeaderProps> = ({
  showUploadDialog,
  setShowUploadDialog,
  handleRefresh,
  handleAddBusiness,
  isRefreshing,
  handleUploadComplete
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight">Business Listings</h1>
      
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button variant="outline" onClick={handleAddBusiness}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
        
        <CSVUploadDialog 
          showUploadDialog={showUploadDialog}
          setShowUploadDialog={setShowUploadDialog}
          handleUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  );
};

export default BusinessListingsHeader;
