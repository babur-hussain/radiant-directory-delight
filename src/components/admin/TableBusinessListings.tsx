
import React, { useState } from 'react';
import { Business } from '@/lib/csv-utils';
import { useBusinessListings } from '@/hooks/useBusinessListings';
import BusinessTableSearch from './table/BusinessTableSearch';
import BusinessTableContent from './table/BusinessTableContent';
import BusinessTableLoading from './table/BusinessTableLoading';
import BusinessPermissionError from './table/BusinessPermissionError';
import BusinessDetailsDialog from './table/BusinessDetailsDialog';
import DeleteBusinessDialog from './table/DeleteBusinessDialog';

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
  
  const handleRefreshData = async () => {
    await refreshData();
    if (onRefresh) {
      onRefresh();
    }
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (businessToDelete) {
      await handleDeleteBusiness(businessToDelete);
      setBusinessToDelete(null);
      setShowDeleteDialog(false);
    }
  };
  
  const handleEditClick = (business: Business) => {
    const isOriginal = business.id <= 20;
    
    if (isOriginal) {
      return;
    }
    
    if (onEditBusiness) {
      onEditBusiness(business);
    }
  };
  
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBusinesses.length);

  return (
    <div className="space-y-4">
      <BusinessPermissionError errorMessage={permissionError || ''} />
      
      <BusinessTableSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefreshData}
        onAddBusiness={onAddBusiness || (() => {})}
        isRefreshing={isRefreshing}
        startIndex={startIndex}
        endIndex={endIndex}
        totalBusinesses={filteredBusinesses.length}
      />
      
      {loading ? (
        <BusinessTableLoading />
      ) : (
        <BusinessTableContent 
          businesses={filteredBusinesses}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onViewDetails={(business) => {
            setSelectedBusiness(business);
            setShowDetailsDialog(true);
          }}
          onEditBusiness={handleEditClick}
          onDeleteBusiness={(business) => {
            setBusinessToDelete(business);
            setShowDeleteDialog(true);
          }}
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
