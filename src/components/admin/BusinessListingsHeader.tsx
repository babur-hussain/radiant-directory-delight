
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Upload } from 'lucide-react';
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
  
  useEffect(() => {
    console.log("BusinessListingsHeader rendered", { showUploadDialog });
  }, [showUploadDialog]);

  const onAddBusinessClick = () => {
    console.log("Add Business button clicked in header");
    handleAddBusiness();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight">Business Listings</h1>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          type="button"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onAddBusinessClick}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
        
        <Button 
          onClick={() => {
            console.log("Upload CSV button clicked");
            setShowUploadDialog(true);
          }}
          type="button"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </div>
      
      {/* Pass the handleUploadComplete function to CSVUploadDialog */}
      <CSVUploadDialog 
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default BusinessListingsHeader;
