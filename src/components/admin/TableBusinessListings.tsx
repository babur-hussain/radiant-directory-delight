
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
import { useToast } from '@/hooks/use-toast';

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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const loadBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First try to fetch from MongoDB
      const data = await fetchBusinesses();
      // Convert IBusiness[] to Business[] to match the state type
      setBusinesses(data as unknown as Business[]);
    } catch (err) {
      console.error("Error fetching businesses from MongoDB:", err);
      
      // Fallback to CSV data
      try {
        const { getAllBusinesses } = await import('@/lib/csv-utils');
        const csvBusinesses = getAllBusinesses();
        setBusinesses(csvBusinesses);
        toast({
          title: "Using local data",
          description: "Could not connect to MongoDB. Using local data instead.",
          variant: "warning"
        });
      } catch (fallbackErr) {
        console.error("Error fetching fallback businesses:", fallbackErr);
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Failed to load businesses");
      }
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
      setIsSubmitting(true);
      // Try deleting from MongoDB
      try {
        await fetch(`http://localhost:3001/api/businesses/${businessId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("MongoDB deletion failed, falling back to local deletion:", err);
        // Fallback to local deletion
        const { deleteBusiness } = await import('@/lib/csv-utils');
        deleteBusiness(parseInt(businessId));
      }
      
      await loadBusinesses();
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Business Deleted",
        description: "The business has been successfully deleted.",
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting business:", error);
      setError("Failed to delete business");
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the business.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open delete dialog
  const openDeleteDialog = (business: Business) => {
    setSelectedBusiness(business as unknown as IBusiness);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    if (onAddBusiness) {
      onAddBusiness();
    } else {
      setIsFormOpen(true);
    }
  };

  const handleEditClick = (business: Business) => {
    if (onEditBusiness) {
      onEditBusiness(business);
    } else {
      setSelectedBusiness(business as unknown as IBusiness);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Try to save to MongoDB first
      try {
        const { saveBusiness } = await import('@/api/mongoAPI');
        await saveBusiness({
          ...selectedBusiness,
          ...values,
          tags: Array.isArray(values.tags) ? values.tags : values.tags.split(',').map((tag: string) => tag.trim())
        });
      } catch (err) {
        console.error("MongoDB save failed, falling back to local save:", err);
        
        // Fallback to local save
        const { updateBusiness, addBusiness } = await import('@/lib/csv-utils');
        if (selectedBusiness) {
          updateBusiness({
            ...selectedBusiness,
            ...values,
            tags: Array.isArray(values.tags) ? values.tags : values.tags.split(',').map((tag: string) => tag.trim())
          } as Business);
        } else {
          const randomReviews = Math.floor(Math.random() * 500) + 50;
          addBusiness({
            name: values.name,
            category: values.category,
            address: values.address,
            phone: values.phone,
            rating: values.rating,
            description: values.description,
            featured: values.featured,
            tags: Array.isArray(values.tags) ? values.tags : values.tags.split(',').map((tag: string) => tag.trim()),
            reviews: randomReviews,
            image: values.image || `https://source.unsplash.com/random/500x350/?${values.category.toLowerCase().replace(/\s+/g, ",")}`
          });
        }
      }
      
      await loadBusinesses();
      setIsFormOpen(false);
      setSelectedBusiness(null);
      
      toast({
        title: selectedBusiness ? "Business Updated" : "Business Added",
        description: `The business has been successfully ${selectedBusiness ? "updated" : "added"}.`,
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error saving business:", error);
      toast({
        title: "Operation Failed",
        description: `There was an error ${selectedBusiness ? "updating" : "adding"} the business.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshData = async () => {
    await loadBusinesses();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    refreshData();
    setIsUploadOpen(false);
    toast({
      title: "CSV Upload Complete",
      description: "Businesses have been successfully imported.",
    });
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
        onSubmit={handleFormSubmit}
        business={selectedBusiness}
        isSubmitting={isSubmitting}
      />

      <CSVUploadDialog 
        show={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadComplete={handleUploadComplete}
      />

      <DeleteBusinessDialog
        business={selectedBusiness}
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id.toString())}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default TableBusinessListings;
