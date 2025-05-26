
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Plus, Users } from "lucide-react";
import InfluencerCSVUploadDialog from "./InfluencerCSVUploadDialog";

interface InfluencerListingsHeaderProps {
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  handleRefresh: () => void;
  handleAddInfluencer: () => void;
  isRefreshing: boolean;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
}

const InfluencerListingsHeader: React.FC<InfluencerListingsHeaderProps> = ({
  showUploadDialog,
  setShowUploadDialog,
  handleRefresh,
  handleAddInfluencer,
  isRefreshing,
  handleUploadComplete
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Influencer Management</h1>
            <p className="text-gray-600">Manage and organize all influencer profiles</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          
          <Button
            onClick={handleAddInfluencer}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Influencer
          </Button>
        </div>
      </div>

      <InfluencerCSVUploadDialog
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};

export default InfluencerListingsHeader;
