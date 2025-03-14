
import React, { useState, useEffect, useCallback } from 'react';
import { Business } from '@/lib/csv-utils';
import { useBusinessListings } from '@/hooks/useBusinessListings';
import BusinessTableSearch from './table/BusinessTableSearch';
import BusinessTableContent from './table/BusinessTableContent';
import BusinessTableLoading from './table/BusinessTableLoading';
import BusinessPermissionError from './table/BusinessPermissionError';
import BusinessDetailsDialog from './table/BusinessDetailsDialog';
import DeleteBusinessDialog from './table/DeleteBusinessDialog';
import { useToast } from '@/hooks/use-toast';

interface TableBusinessListingsProps {
  onRefresh?: () => void;
  onAddBusiness?: () => void;
  onEditBusiness?: (business: Business) => void;
}

export const TableBusinessListings: React.FC<TableBusinessListingsProps> = ({ 
  onRefresh,
  onAddBusiness,
  onEditBusiness
}) => {
  const { toast } = useToast();
  const { 
    businesses, 
    isRefreshing, 
    loading, 
    permissionError, 
    refreshData,
    handleDeleteBusiness 
  } = useBusinessListings();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const itemsPerPage = 40;
  
  const handleRefreshData = useCallback(async () => {
    console.log('handleRefreshData called');
    await refreshData();
    if (onRefresh) {
      onRefresh();
    }
  }, [refreshData, onRefresh]);
  
  const handleSearchChange = useCallback((term: string) => {
    console.log('Search term changed:', term);
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    console.log('Confirming delete for business:', businessToDelete);
    if (businessToDelete) {
      const result = await handleDeleteBusiness(businessToDelete);
      if (result) {
        toast({
          title: "Business Deleted",
          description: `"${businessToDelete.name}" has been removed successfully.`,
        });
      }
      setBusinessToDelete(null);
      setShowDeleteDialog(false);
    }
  }, [businessToDelete, handleDeleteBusiness, toast]);
  
  const handleEditClick = useCallback((business: Business) => {
    console.log('Edit business clicked:', business);
    const isOriginal = business.id <= 20;
    
    if (isOriginal) {
      toast({
        title: "Cannot Edit Original Data",
        description: "Demo businesses cannot be edited in this example.",
        variant: "destructive"
      });
      return;
    }
    
    if (onEditBusiness) {
      onEditBusiness(business);
    }
  }, [onEditBusiness, toast]);
  
  const handleViewDetails = useCallback((business: Business) => {
    console.log('View details for business:', business);
    setSelectedBusiness(business);
    setShowDetailsDialog(true);
  }, []);
  
  const handleDeleteClick = useCallback((business: Business) => {
    console.log('Delete business clicked:', business);
    const isOriginal = business.id <= 20;
    
    if (isOriginal) {
      toast({
        title: "Cannot Delete Original Data",
        description: "Demo businesses cannot be deleted in this example.",
        variant: "destructive"
      });
      return;
    }
    
    setBusinessToDelete(business);
    setShowDeleteDialog(true);
  }, [toast]);
  
  const handleAddBusinessClick = useCallback(() => {
    console.log('Add business button clicked in TableBusinessListings');
    if (onAddBusiness) {
      onAddBusiness();
    }
  }, [onAddBusiness]);
  
  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination values for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBusinesses.length);

  useEffect(() => {
    console.log('TableBusinessListings rendered', { 
      businessCount: businesses.length,
      filteredCount: filteredBusinesses.length,
      loading,
      isRefreshing
    });
  }, [businesses.length, filteredBusinesses.length, loading, isRefreshing]);

  return (
    <div className="space-y-4">
      <BusinessPermissionError errorMessage={permissionError || ''} />
      
      <BusinessTableSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefreshData}
        onAddBusiness={handleAddBusinessClick}
        isRefreshing={isRefreshing}
        startIndex={startIndex}
        endIndex={endIndex}
        totalBusinesses={filteredBusinesses.length}
      />
      
      {loading ? (
        <BusinessTableLoading />
      ) : filteredBusinesses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No businesses found matching your search criteria.</p>
        </div>
      ) : (
        <BusinessTableContent 
          businesses={filteredBusinesses}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onViewDetails={handleViewDetails}
          onEditBusiness={handleEditClick}
          onDeleteBusiness={handleDeleteClick}
        />
      )}
      
      <BusinessDetailsDialog 
        business={selectedBusiness}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      
      <DeleteBusinessDialog 
        business={businessToDelete}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
};
