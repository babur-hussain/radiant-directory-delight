
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllBusinesses, addBusiness, updateBusiness, Business } from "@/lib/csv-utils";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import { TableBusinessListings } from "@/components/admin/TableBusinessListings";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import BusinessListingsHeader from "@/components/admin/BusinessListingsHeader";
import BusinessFormDialog from "@/components/admin/BusinessFormDialog";

const AdminBusinessListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBusinessFormDialog, setShowBusinessFormDialog] = useState(false);
  const [businessCount, setBusinessCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBusinessToEdit, setCurrentBusinessToEdit] = useState<Business | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    setBusinessCount(getAllBusinesses().length);
  }, []);
  
  if (!isAuthenticated) {
    return <UnauthorizedView />;
  }
  
  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    if (success) {
      setBusinessCount(getAllBusinesses().length);
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setBusinessCount(getAllBusinesses().length);
      setIsRefreshing(false);
    }, 500);
  };
  
  const handleAddBusiness = () => {
    console.log("Add business button clicked");
    setCurrentBusinessToEdit(null);
    setShowBusinessFormDialog(true);
  };
  
  const handleEditBusiness = (business: Business) => {
    setCurrentBusinessToEdit(business);
    setShowBusinessFormDialog(true);
  };
  
  const handleBusinessFormSubmit = async (values: BusinessFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert the priority value to a number or undefined
      const priorityValue = values.priority === undefined || values.priority === '' ? undefined : 
                            typeof values.priority === 'string' ? parseInt(values.priority, 10) : 
                            values.priority;
      
      if (currentBusinessToEdit) {
        const updated = updateBusiness({
          ...currentBusinessToEdit,
          ...values,
          // Convert tags back to an array if it's a string
          tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()) : values.tags,
          priority: priorityValue
        });
        
        if (updated) {
          toast({
            title: "Business Updated",
            description: `${values.name} has been updated successfully.`,
          });
        } else {
          toast({
            title: "Update Failed",
            description: "Failed to update the business.",
            variant: "destructive",
          });
        }
      } else {
        const randomReviews = Math.floor(Math.random() * 500) + 50;
        
        const newBusinessPromise = addBusiness({
          name: values.name,
          category: values.category,
          address: values.address,
          phone: values.phone, 
          rating: values.rating,
          description: values.description,
          featured: values.featured,
          // Convert tags to an array if it's a string
          tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()) : values.tags,
          reviews: randomReviews,
          priority: priorityValue,
          image: values.image || `https://source.unsplash.com/random/500x350/?${values.category.toLowerCase().replace(/\s+/g, ',')}`
        });
        
        const newBusiness = await newBusinessPromise;
        
        toast({
          title: "Business Added",
          description: `${newBusiness.name} has been added successfully.`,
        });
      }
      
      setShowBusinessFormDialog(false);
      setCurrentBusinessToEdit(null);
      handleRefresh();
    } catch (error) {
      console.error("Error saving business:", error);
      toast({
        title: "Operation Failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("Rendering AdminBusinessListingsPage", { showUploadDialog, showBusinessFormDialog });

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
        showDialog={showBusinessFormDialog}
        setShowDialog={setShowBusinessFormDialog}
        currentBusinessToEdit={currentBusinessToEdit}
        onSubmit={handleBusinessFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminBusinessListingsPage;
