
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import BusinessTableContent from "../table/BusinessTableContent";
import BusinessTableSearch from "../table/BusinessTableSearch";
import BusinessFormDialog from "../BusinessFormDialog";
import CSVUploadDialog from "../CSVUploadDialog";
import BusinessTableLoading from "../table/BusinessTableLoading";
import { Business } from "@/lib/csv-utils";
import { BusinessFormValues } from "../BusinessForm";
import DeleteBusinessDialog from "../table/DeleteBusinessDialog";
import BusinessDetailsDialog from "../table/BusinessDetailsDialog";

interface BusinessesTabProps {
  businessCount: number;
  showBusinessFormDialog: boolean;
  setShowBusinessFormDialog: (show: boolean) => void;
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  currentBusinessToEdit: Business | null;
  isSubmitting: boolean;
  handleBusinessFormSubmit: (values: BusinessFormValues) => Promise<void>;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
  handleAddBusiness: () => void;
  handleEditBusiness: (business: Business) => void;
  onViewDetails: (business: Business) => void;
}

const BusinessesTab = ({
  businessCount,
  showBusinessFormDialog,
  setShowBusinessFormDialog,
  showUploadDialog,
  setShowUploadDialog,
  currentBusinessToEdit,
  isSubmitting,
  handleBusinessFormSubmit,
  handleUploadComplete,
  handleAddBusiness,
  handleEditBusiness,
  onViewDetails
}: BusinessesTabProps) => {
  const { businesses, loading: isLoading } = useBusinessListings();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(40);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Filter businesses by search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBusiness = (business: Business) => {
    setBusinessToDelete(business);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    // Delete logic here
    console.log("Delete business:", businessToDelete);
    setShowDeleteDialog(false);
  };
  
  const handleViewBusinessDetails = (business: Business) => {
    console.log("Viewing business details:", business);
    setSelectedBusiness(business);
    setShowDetailsDialog(true);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <BusinessTableSearch 
            searchTerm={searchTerm} 
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddBusiness}
              className="flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Business
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(true)}
              className="flex-1 sm:flex-none"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload CSV
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <BusinessTableLoading />
        ) : (
          <BusinessTableContent 
            businesses={filteredBusinesses}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onViewDetails={handleViewBusinessDetails}
            onEditBusiness={handleEditBusiness}
            onDeleteBusiness={handleDeleteBusiness}
          />
        )}
      </CardContent>
      
      {/* Business Form Dialog for Add/Edit */}
      <BusinessFormDialog 
        show={showBusinessFormDialog}
        onClose={() => setShowBusinessFormDialog(false)}
        business={currentBusinessToEdit}
        onSubmit={handleBusinessFormSubmit}
        isSubmitting={isSubmitting}
      />
      
      {/* CSV Upload Dialog */}
      <CSVUploadDialog 
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteBusinessDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        business={businessToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
      
      {/* Business Details Dialog */}
      <BusinessDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        business={selectedBusiness}
      />
    </Card>
  );
};

export default BusinessesTab;
