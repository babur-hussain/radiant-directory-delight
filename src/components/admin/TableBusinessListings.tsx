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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 40;
  
  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await initializeData();
      setBusinesses(getAllBusinesses());
      setPermissionError(null);
      
      toast({
        title: "Data refreshed",
        description: "The business listings have been updated from the database.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      
      // Check for permission error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("permission") || errorMessage.includes("Permission")) {
        setPermissionError("Permission denied when accessing businesses. Using default data instead.");
        toast({
          title: "Permission Error",
          description: "You don't have access to business data. Using default data instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Refresh failed",
          description: "There was an error refreshing the business data.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
      
      if (onRefresh) {
        onRefresh();
      }
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await initializeData();
        setBusinesses(getAllBusinesses());
        setPermissionError(null);
      } catch (error) {
        console.error("Error loading businesses:", error);
        
        // Check for permission error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("permission") || errorMessage.includes("Permission")) {
          setPermissionError("Permission denied when accessing businesses. Using default data instead.");
          toast({
            title: "Permission Error",
            description: "You don't have access to business data. Using default data instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Loading failed",
            description: "There was an error loading the business data.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    const handleDataChanged = () => {
      setBusinesses(getAllBusinesses());
    };
    
    const handlePermissionError = (e: CustomEvent) => {
      setPermissionError(e.detail.message);
      toast({
        title: "Permission Error",
        description: "You don't have access to business data. Using default data instead.",
        variant: "destructive",
      });
    };
    
    addDataChangeListener(handleDataChanged);
    window.addEventListener('businessPermissionError', handlePermissionError as EventListener);
    
    return () => {
      removeDataChangeListener(handleDataChanged);
      window.removeEventListener('businessPermissionError', handlePermissionError as EventListener);
    };
  }, [toast]);
  
  const handleDeleteBusiness = async () => {
    if (businessToDelete) {
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
  
  const handleEditClick = (business: Business) => {
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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBusinesses.length);
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {permissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            {permissionError}
          </AlertDescription>
        </Alert>
      )}
      
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading businesses...</span>
        </div>
      ) : (
        <>
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
          
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
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
        onConfirmDelete={handleDeleteBusiness}
      />
    </div>
  );
};
