
import React, { useState } from "react";
import { Business } from "@/lib/csv-utils";
import BusinessTable from "../table/BusinessTable";
import BusinessDetailsDialog from "../table/BusinessDetailsDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BusinessesTabProps {
  businesses: Business[];
  onAddBusiness?: () => void;
  handleAddBusiness: () => void;
  handleEditBusiness: (business: Business) => void;
  isRefreshing: boolean;
  onRefresh?: () => Promise<void> | void;
  onViewDetails?: (business: Business) => void;
}

const BusinessesTab: React.FC<BusinessesTabProps> = ({
  businesses,
  handleAddBusiness,
  handleEditBusiness,
  isRefreshing,
  onRefresh,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Handle viewing business details
  const handleViewDetails = (business: Business) => {
    setSelectedBusiness(business);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={handleAddBusiness}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Business
        </Button>
      </div>
      
      <BusinessTable
        businesses={businesses}
        onViewDetails={onViewDetails || handleViewDetails}
        onEditBusiness={handleEditBusiness}
        onDeleteBusiness={() => {}}
      />
      
      {selectedBusiness && (
        <BusinessDetailsDialog
          business={selectedBusiness}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  );
};

export default BusinessesTab;
