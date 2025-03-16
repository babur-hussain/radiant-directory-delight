
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BusinessFormDialog from './BusinessFormDialog';
import TableBusinessContent from './TableBusinessContent';
import CSVUploadDialog from './CSVUploadDialog';
import BusinessTableLoading from './table/BusinessTableLoading';
import { useBusinessListings } from '@/hooks/useBusinessListings';
import { IBusiness } from '@/models/Business';
import DeleteBusinessDialog from './table/DeleteBusinessDialog';
import BusinessPermissionError from './table/BusinessPermissionError';

const TableBusinessListings = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Use the useBusinessListings hook
  const { businesses, isLoading, error, refreshData } = useBusinessListings();
  
  // Function to handle business deletion
  const handleDeleteBusiness = async (businessId: string) => {
    try {
      // Use MongoDB functionality to delete business
      // This would be implemented in the refreshData call after deletion
      await refreshData();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  // Function to open delete dialog
  const openDeleteDialog = (business: IBusiness) => {
    setSelectedBusiness(business);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="business-table-container">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Business Listings</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadOpen(true)} variant="outline" size="sm">
            Import CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {error ? (
        <BusinessPermissionError message={error} />
      ) : isLoading ? (
        <BusinessTableLoading />
      ) : (
        <TableBusinessContent 
          businesses={businesses}
          onEdit={(business) => {
            setSelectedBusiness(business);
            setIsFormOpen(true);
          }}
          onDelete={openDeleteDialog}
          onRefresh={refreshData}
        />
      )}

      <BusinessFormDialog 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBusiness(null);
        }}
        onSave={async () => {
          await refreshData();
          setIsFormOpen(false);
          setSelectedBusiness(null);
        }}
        initialData={selectedBusiness}
      />

      <CSVUploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={refreshData}
      />

      <DeleteBusinessDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id)}
        businessName={selectedBusiness?.name || ""}
      />
    </div>
  );
};

export default TableBusinessListings;
