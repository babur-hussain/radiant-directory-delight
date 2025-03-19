
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BusinessFormDialog from './BusinessFormDialog';
import BusinessTableLoading from './table/BusinessTableLoading';
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
import { fetchBusinesses } from '@/api/mongoAPI';

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
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBusinesses();
      setBusinesses(data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(err instanceof Error ? err.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadBusinesses();
  }, []);
  
  // Function to handle business deletion
  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await fetch(`http://localhost:3001/api/businesses/${businessId}`, {
        method: 'DELETE'
      });
      
      await loadBusinesses();
      setIsDeleteDialogOpen(false);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting business:", error);
      setError("Failed to delete business");
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
      onEditBusiness(business as unknown as Business);
    } else {
      setSelectedBusiness(business);
      setIsFormOpen(true);
    }
  };

  const refreshData = async () => {
    await loadBusinesses();
    if (onRefresh) {
      onRefresh();
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
        }}
        business={selectedBusiness}
        isSubmitting={false}
      />

      <CSVUploadDialog 
        show={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadComplete={() => {
          refreshData();
        }}
      />

      <DeleteBusinessDialog
        business={selectedBusiness}
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id.toString())}
      />
    </div>
  );
};

export default TableBusinessListings;
