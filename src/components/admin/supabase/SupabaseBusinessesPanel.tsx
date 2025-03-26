import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BusinessFormDialog from '../BusinessFormDialog';
import BusinessTableLoading from '../table/BusinessTableLoading';
import DeleteBusinessDialog from '../table/DeleteBusinessDialog';
import BusinessPermissionError from '../table/BusinessPermissionError';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CSVUploadDialog from '../CSVUploadDialog';
import BusinessTableRow from '../table/BusinessTableRow';
import { Business, convertToCsvBusiness, toNumberId } from '@/types/business';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface IBusiness {
  id: number;
  name: string;
  category: string;
  description: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  tags?: string[];
  image?: string;
  email?: string;
  website?: string;
  hours?: string | Record<string, string>;
  latitude?: number;
  longitude?: number;
}

const SupabaseBusinessesPanel = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadBusinesses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setBusinesses(data as Business[]);
    } catch (err) {
      console.error("Error fetching businesses from Supabase:", err);
      setError(err instanceof Error ? err.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadBusinesses();
  }, []);
  
  const handleDeleteBusiness = async (id: string | number) => {
    setIsDeleting(true);
    try {
      // Convert to number id for Supabase
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', numericId);
      
      if (error) throw error;
      
      await loadBusinesses();
      toast({
        title: "Business Deleted",
        description: "The business has been successfully deleted."
      });
    } catch (err) {
      console.error("Error deleting business:", err);
      toast({
        title: "Error Deleting Business",
        description: "There was a problem deleting the business.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleFeatureToggle = async (id: string | number, featured: boolean) => {
    setIsUpdating(true);
    try {
      // Convert to number id for Supabase
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const { error } = await supabase
        .from('businesses')
        .update({ featured: !featured })
        .eq('id', numericId);
      
      if (error) throw error;
      
      await loadBusinesses();
      toast({
        title: "Business Updated",
        description: `Business has been ${!featured ? "featured" : "unfeatured"}.`
      });
    } catch (err) {
      console.error("Error updating business:", err);
      toast({
        title: "Error Updating Business",
        description: "There was a problem updating the business.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteDialog = (business: Business) => {
    setSelectedBusiness({
      id: typeof business.id === 'number' ? business.id : parseInt(business.id as string, 10),
      name: business.name,
      category: business.category || '',
      description: business.description || '',
      address: business.address,
      phone: business.phone,
      rating: business.rating,
      reviews: business.reviews,
      featured: business.featured,
      tags: business.tags,
      image: business.image,
      email: business.email,
      website: business.website,
      hours: business.hours,
      latitude: business.latitude,
      longitude: business.longitude
    });
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleEditClick = (business: Business) => {
    setSelectedBusiness({
      id: typeof business.id === 'number' ? business.id : parseInt(business.id as string, 10),
      name: business.name,
      category: business.category || '',
      description: business.description || '',
      address: business.address,
      phone: business.phone,
      rating: business.rating,
      reviews: business.reviews,
      featured: business.featured,
      tags: business.tags,
      image: business.image,
      email: business.email,
      website: business.website,
      hours: business.hours,
      latitude: business.latitude,
      longitude: business.longitude
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const tags = typeof values.tags === "string" 
        ? values.tags.split(',').map((tag: string) => tag.trim()) 
        : values.tags;
      
      if (selectedBusiness) {
        const { error } = await supabase
          .from('businesses')
          .update({
            ...selectedBusiness,
            ...values,
            tags
          })
          .eq('id', selectedBusiness.id);
        
        if (error) throw error;
      } else {
        const randomReviews = Math.floor(Math.random() * 500) + 50;
        const newBusiness = {
          name: values.name,
          category: values.category,
          address: values.address,
          phone: values.phone,
          rating: values.rating,
          description: values.description,
          featured: values.featured,
          tags,
          reviews: randomReviews,
          image: values.image || `https://source.unsplash.com/random/500x350/?${values.category.toLowerCase().replace(/\s+/g, ",")}`
        };
        
        const { error } = await supabase
          .from('businesses')
          .insert([newBusiness]);
        
        if (error) throw error;
      }
      
      await loadBusinesses();
      setIsFormOpen(false);
      setSelectedBusiness(null);
      
      toast({
        title: selectedBusiness ? "Business Updated" : "Business Added",
        description: `The business has been successfully ${selectedBusiness ? "updated" : "added"}.`,
      });
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
  };

  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    refreshData();
    setIsUploadOpen(false);
    toast({
      title: "CSV Upload Complete",
      description: "Businesses have been successfully imported.",
    });
  };

  const filteredBusinesses = businesses.filter(business => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      business.name.toLowerCase().includes(searchTerm) ||
      business.category?.toLowerCase().includes(searchTerm) ||
      business.address?.toLowerCase().includes(searchTerm)
    );
  });

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

      <div className="relative w-full sm:w-64 mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                <TableHead>Featured</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredBusinesses || filteredBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses.map((business) => (
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
        onConfirmDelete={() => selectedBusiness && handleDeleteBusiness(selectedBusiness.id)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SupabaseBusinessesPanel;
