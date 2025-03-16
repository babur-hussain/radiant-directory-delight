
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BusinessFormDialog from './BusinessFormDialog';
import BusinessTableLoading from './table/BusinessTableLoading';
import { useBusinessListings } from '@/hooks/useBusinessListings';
import { IBusiness } from '@/models/Business';
import DeleteBusinessDialog from './table/DeleteBusinessDialog';
import BusinessPermissionError from './table/BusinessPermissionError';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CSVUploadDialog from './CSVUploadDialog';
import BusinessTableRow from './table/BusinessTableRow';
import { Business } from '@/lib/csv-utils';

interface TableBusinessListingsProps {
  onRefresh?: () => void;
  onAddBusiness?: () => void;
  onEditBusiness?: (business: Business) => void;
}

const TableBusinessListings: React.FC<TableBusinessListingsProps> = ({ 
  onRefresh, 
  onAddBusiness, 
  onEditBusiness 
}) => {
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
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  // Function to open delete dialog
  const openDeleteDialog = (business: IBusiness) => {
    setSelectedBusiness(business);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    if (onAddBusiness) {
      onAddBusiness();
    } else {
      setIsFormOpen(true);
    }
  };

  const handleEditClick = (business: IBusiness) => {
    if (onEditBusiness) {
      onEditBusiness(business as Business);
    } else {
      setSelectedBusiness(business);
      setIsFormOpen(true);
    }
  };

  return (
    <div className="business-table-container">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Business Listings</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadOpen(true)} variant="outline" size="sm">
            Import CSV
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {error ? (
        <BusinessPermissionError errorMessage={error} />
      ) : isLoading ? (
        <BusinessTableLoading />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!businesses || businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((business) => (
                  <BusinessTableRow 
                    key={business.id}
                    business={business}
                    onViewDetails={() => {}}
                    onEditBusiness={() => handleEditClick(business)}
                    onDeleteBusiness={() => openDeleteDialog(business)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BusinessFormDialog 
        show={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBusiness(null);
        }}
        onSubmit={async () => {
          await refreshData();
          setIsFormOpen(false);
          setSelectedBusiness(null);
          if (onRefresh) {
            onRefresh();
          }
        }}
        business={selectedBusiness}
        isSubmitting={false}
      />

      <CSVUploadDialog 
        show={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadComplete={() => {
          refreshData();
          if (onRefresh) {
            onRefresh();
          }
        }}
      />

      <DeleteBusinessDialog
        business={selectedBusiness}
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id)}
      />
    </div>
  );
};

export default TableBusinessListings;
