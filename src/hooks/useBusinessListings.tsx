
import { useState, useEffect } from 'react';
import { 
  getAllBusinesses, 
  addDataChangeListener, 
  removeDataChangeListener,
  deleteBusiness,
  Business,
  initializeData
} from '@/lib/csv-utils';
import { useToast } from '@/hooks/use-toast';

export function useBusinessListings() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();

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
    }
  };

  const handleDeleteBusiness = async (businessToDelete: Business) => {
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
    
    return businessToDelete;
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

  return {
    businesses,
    isRefreshing,
    loading,
    permissionError,
    refreshData,
    handleDeleteBusiness
  };
}
