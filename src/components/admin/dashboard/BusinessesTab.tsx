
import React, { useState } from "react";
import { Business } from "@/lib/csv-utils";
import BusinessTable from "../table/BusinessTable";
import BusinessDetailsDialog from "../table/BusinessDetailsDialog";

interface BusinessesTabProps {
  businesses: Business[];
  onAddBusiness: () => void;
  onEditBusiness: (business: Business) => void;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  handlePermissionError: (error: any) => void;
}

const BusinessesTab: React.FC<BusinessesTabProps> = ({
  businesses,
  onAddBusiness,
  onEditBusiness,
  isRefreshing,
  onRefresh,
  handlePermissionError,
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
      <BusinessTable
        businesses={businesses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddBusiness={onAddBusiness}
        onEditBusiness={onEditBusiness}
        onViewDetails={handleViewDetails}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onError={handlePermissionError}
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
