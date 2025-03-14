
import React, { useState, useEffect } from 'react';
import { 
  getAllBusinesses, 
  addDataChangeListener, 
  removeDataChangeListener,
  deleteBusiness,
  Business 
} from '@/lib/csv-utils';
import { useToast } from '@/hooks/use-toast';
import BusinessTable from './table/BusinessTable';
import BusinessTableSearch from './table/BusinessTableSearch';
import TablePagination from './table/TablePagination';
import DeleteBusinessDialog from './table/DeleteBusinessDialog';
import BusinessDetailsDialog from './table/BusinessDetailsDialog';

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
  const [businesses, setBusinesses] = useState(getAllBusinesses());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 100;
  
  // Handle data changes and refreshes
  const refreshData = () => {
    setIsRefreshing(true);
    // Get the latest data
    setBusinesses(getAllBusinesses());
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "The business listings have been updated.",
      });
    }, 500); // small delay for visual feedback
    
    // Notify parent component if needed
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Listen for data changes
  useEffect(() => {
    // Initial data load
    refreshData();
    
    // Add a listener for data changes
    addDataChangeListener(refreshData);
    
    // Cleanup on unmount
    return () => {
      removeDataChangeListener(refreshData);
    };
  }, []);
  
  // Handle delete business
  const handleDeleteBusiness = () => {
    if (businessToDelete) {
      // Check if it's from the original data set or uploaded
      const isUploaded = businessToDelete.id > 20;
      
      if (isUploaded) {
        const deleted = deleteBusiness(businessToDelete.id);
        
        if (deleted) {
          toast({
            title: "Business deleted",
            description: `${businessToDelete.name} has been removed.`,
          });
          refreshData();
        } else {
          toast({
            title: "Delete failed",
            description: "The business could not be deleted.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Cannot delete original data",
          description: "Only imported or manually added businesses can be deleted in this demo.",
          variant: "destructive",
        });
      }
    }
    
    setBusinessToDelete(null);
    setShowDeleteDialog(false);
  };
  
  // Handle edit business
  const handleEditClick = (business: Business) => {
    // Check if it's from the original data
    const isOriginal = business.id <= 20;
    
    if (isOriginal) {
      toast({
        title: "Cannot edit original data",
        description: "Only imported or manually added businesses can be edited in this demo.",
        variant: "destructive",
      });
      return;
    }
    
    if (onEditBusiness) {
      onEditBusiness(business);
    }
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBusinesses.length);
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Search and actions bar */}
      <BusinessTableSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onRefresh={refreshData}
        onAddBusiness={onAddBusiness || (() => {})}
        isRefreshing={isRefreshing}
        startIndex={startIndex}
        endIndex={endIndex}
        totalBusinesses={filteredBusinesses.length}
      />
      
      {/* Table */}
      <BusinessTable 
        businesses={currentBusinesses}
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
      
      {/* Pagination */}
      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      {/* Business Details Dialog */}
      <BusinessDetailsDialog 
        business={selectedBusiness}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteBusinessDialog 
        business={businessToDelete}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDeleteBusiness}
      />
    </div>
  );
};
