
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import TableBusinessListings from "@/components/admin/TableBusinessListings";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import BusinessListingsHeader from "@/components/admin/BusinessListingsHeader";
import BusinessFormDialog from "@/components/admin/BusinessFormDialog";
import BusinessPermissionError from "@/components/admin/table/BusinessPermissionError";
import { supabase } from "@/integrations/supabase/client";

const AdminBusinessListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBusinessFormDialog, setShowBusinessFormDialog] = useState(false);
  const [businessCount, setBusinessCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBusinessToEdit, setCurrentBusinessToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  
  // Fetch business count from Supabase
  const fetchBusinessCount = async () => {
    try {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setBusinessCount(count || 0);
    } catch (error) {
      console.error("Error fetching business count:", error);
      toast({
        title: "Error",
        description: "Failed to fetch business count",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchBusinessCount();
  }, []);
  
  if (!isAuthenticated) {
    return <UnauthorizedView />;
  }
  
  const handleUploadComplete = async (success: boolean, message: string, count?: number) => {
    if (success) {
      await fetchBusinessCount();
      toast({
        title: "Upload Successful",
        description: `${count} businesses have been imported successfully.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinessCount();
    setIsRefreshing(false);
  };
  
  const handleAddBusiness = () => {
    console.log("Add business button clicked");
    setCurrentBusinessToEdit(null);
    setShowBusinessFormDialog(true);
  };
  
  const handleEditBusiness = (business) => {
    setCurrentBusinessToEdit(business);
    setShowBusinessFormDialog(true);
  };
  
  const handleBusinessFormSubmit = async (values: BusinessFormValues) => {
    setIsSubmitting(true);
    setPermissionError(null);
    
    try {
      // Prepare tags as an array
      const tags = typeof values.tags === "string" 
        ? values.tags.split(",").map(tag => tag.trim()) 
        : values.tags;
      
      if (currentBusinessToEdit) {
        // Update existing business
        const { error } = await supabase
          .from('businesses')
          .update({
            ...values,
            tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentBusinessToEdit.id);
        
        if (error) throw error;
        
        toast({ 
          title: "Business Updated", 
          description: `${values.name} has been updated successfully.` 
        });
      } else {
        // Create new business
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
          image: values.image || `https://source.unsplash.com/random/500x350/?${values.category.toLowerCase().replace(/\s+/g, ",")}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('businesses')
          .insert([newBusiness]);
        
        if (error) throw error;
        
        toast({ 
          title: "Business Added", 
          description: `${values.name} has been added successfully.` 
        });
      }
      
      setShowBusinessFormDialog(false);
      setCurrentBusinessToEdit(null);
      handleRefresh();
    } catch (error) {
      console.error("Error saving business:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("permission-denied") || 
          errorMessage.includes("Permission denied") ||
          errorMessage.includes("insufficient permissions") ||
          errorMessage.includes("Missing or insufficient permissions")) {
        setPermissionError("Permission denied. You don't have admin rights to create or update business listings.");
      } else {
        toast({
          title: "Operation Failed",
          description: `Error: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <BusinessListingsHeader 
        showUploadDialog={showUploadDialog}
        setShowUploadDialog={setShowUploadDialog}
        handleRefresh={handleRefresh}
        handleAddBusiness={handleAddBusiness}
        isRefreshing={isRefreshing}
        handleUploadComplete={handleUploadComplete}
      />
      
      {permissionError && (
        <BusinessPermissionError errorMessage={permissionError} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Business Listings</CardTitle>
          <CardDescription>
            View and manage all business listings. Total: {businessCount} businesses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableBusinessListings 
            onRefresh={handleRefresh} 
            onAddBusiness={handleAddBusiness}
            onEditBusiness={handleEditBusiness}
          />
        </CardContent>
      </Card>
      
      <BusinessFormDialog 
        show={showBusinessFormDialog}
        onClose={() => setShowBusinessFormDialog(false)}
        business={currentBusinessToEdit}
        onSubmit={handleBusinessFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminBusinessListingsPage;
