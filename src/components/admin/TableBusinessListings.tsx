
import React, { useState, useEffect } from 'react';
import { 
  getAllBusinesses, 
  addDataChangeListener, 
  removeDataChangeListener,
  deleteBusiness,
  Business,
  initializeData
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const itemsPerPage = 100;
  
  // Handle data changes and refreshes
  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Initialize data from Firestore
      await initializeData();
      
      // Get the latest data
      setBusinesses(getAllBusinesses());
      
      toast({
        title: "Data refreshed",
        description: "The business listings have been updated from the database.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing the business data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      
      // Notify parent component if needed
      if (onRefresh) {
        onRefresh();
      }
    }
  };
  
  // Listen for data changes
  useEffect(() => {
    // Initial data load
    const loadData = async () => {
      setLoading(true);
      try {
        await initializeData();
        setBusinesses(getAllBusinesses());
      } catch (error) {
        console.error("Error loading businesses:", error);
        toast({
          title: "Loading failed",
          description: "There was an error loading the business data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Add a listener for data changes
    const handleDataChanged = () => {
      setBusinesses(getAllBusinesses());
    };
    
    addDataChangeListener(handleDataChanged);
    
    // Cleanup on unmount
    return () => {
      removeDataChangeListener(handleDataChanged);
    };
  }, []);
  
  // Handle delete business
  const handleDeleteBusiness = async () => {
    if (businessToDelete) {
      // Check if it's from the original data set or uploaded
      const isUploaded = businessToDelete.id > 20;
      
      if (isUploaded) {
        setIsRefreshing(true);
        try {
          const deleted = await deleteBusiness(businessToDelete.id);
          
          if (deleted) {
            toast({
              title: "Business deleted",
              description: `${businessToDelete.name} has been removed.`,
            });
          } else {
            toast({
              title: "Delete failed",
              description: "The business could not be deleted.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error deleting business:", error);
          toast({
            title: "Delete failed",
            description: "There was an error deleting the business.",
            variant: "destructive",
          });
        } finally {
          setIsRefreshing(false);
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
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading businesses...</span>
        </div>
      ) : (
        <>
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
        </>
      )}
      
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
