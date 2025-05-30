
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InfluencerFormValues } from "@/components/admin/InfluencerForm";
import TableInfluencerListings from "@/components/admin/TableInfluencerListings";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import InfluencerListingsHeader from "@/components/admin/InfluencerListingsHeader";
import InfluencerFormDialog from "@/components/admin/InfluencerFormDialog";
import InfluencerPermissionError from "@/components/admin/table/InfluencerPermissionError";
import { supabase } from "@/integrations/supabase/client";

const AdminInfluencerListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInfluencerFormDialog, setShowInfluencerFormDialog] = useState(false);
  const [influencerCount, setInfluencerCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentInfluencerToEdit, setCurrentInfluencerToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  
  // Fetch influencer count from Supabase
  const fetchInfluencerCount = async () => {
    try {
      const { count, error } = await supabase
        .from('influencers')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setInfluencerCount(count || 0);
    } catch (error) {
      console.error("Error fetching influencer count:", error);
      toast({
        title: "Error",
        description: "Failed to fetch influencer count",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchInfluencerCount();
  }, []);
  
  if (!isAuthenticated) {
    return <UnauthorizedView />;
  }
  
  const handleUploadComplete = async (success: boolean, message: string, count?: number) => {
    if (success) {
      await fetchInfluencerCount();
      toast({
        title: "Upload Successful",
        description: `${count} influencers have been imported successfully.`,
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
    await fetchInfluencerCount();
    setIsRefreshing(false);
  };
  
  const handleAddInfluencer = () => {
    console.log("Add influencer button clicked");
    setCurrentInfluencerToEdit(null);
    setShowInfluencerFormDialog(true);
  };
  
  const handleEditInfluencer = (influencer) => {
    setCurrentInfluencerToEdit(influencer);
    setShowInfluencerFormDialog(true);
  };
  
  const handleInfluencerFormSubmit = async (values: InfluencerFormValues) => {
    setIsSubmitting(true);
    setPermissionError(null);
    
    try {
      // Prepare tags as an array
      const tags = typeof values.tags === "string" 
        ? values.tags.split(",").map(tag => tag.trim()) 
        : values.tags;
      
      // Prepare previous_brands as an array
      const previous_brands = typeof values.previous_brands === "string"
        ? values.previous_brands.split(",").map(brand => brand.trim())
        : values.previous_brands;
      
      if (currentInfluencerToEdit) {
        // Update existing influencer
        const { error } = await supabase
          .from('influencers')
          .update({
            ...values,
            tags,
            previous_brands,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentInfluencerToEdit.id);
        
        if (error) throw error;
        
        toast({ 
          title: "Influencer Updated", 
          description: `${values.name} has been updated successfully.` 
        });
      } else {
        // Create new influencer
        const randomReviews = Math.floor(Math.random() * 500) + 50;
        const newInfluencer = {
          name: values.name,
          niche: values.niche,
          email: values.email,
          phone: values.phone,
          bio: values.bio,
          location: values.location,
          followers_count: values.followers_count || 0,
          engagement_rate: values.engagement_rate || 0,
          rating: values.rating || 0,
          featured: values.featured || false,
          priority: values.priority || 0,
          instagram_handle: values.instagram_handle,
          youtube_handle: values.youtube_handle,
          tiktok_handle: values.tiktok_handle,
          facebook_handle: values.facebook_handle,
          twitter_handle: values.twitter_handle,
          linkedin_handle: values.linkedin_handle,
          website: values.website,
          profile_image: values.profile_image,
          cover_image: values.cover_image,
          tags,
          previous_brands,
          reviews_count: randomReviews,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('influencers')
          .insert([newInfluencer]);
        
        if (error) throw error;
        
        toast({ 
          title: "Influencer Added", 
          description: `${values.name} has been added successfully.` 
        });
      }
      
      setShowInfluencerFormDialog(false);
      setCurrentInfluencerToEdit(null);
      handleRefresh();
    } catch (error) {
      console.error("Error saving influencer:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("permission-denied") || 
          errorMessage.includes("Permission denied") ||
          errorMessage.includes("insufficient permissions") ||
          errorMessage.includes("Missing or insufficient permissions")) {
        setPermissionError("Permission denied. You don't have admin rights to create or update influencer listings.");
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
      <InfluencerListingsHeader 
        showUploadDialog={showUploadDialog}
        setShowUploadDialog={setShowUploadDialog}
        handleRefresh={handleRefresh}
        handleAddInfluencer={handleAddInfluencer}
        isRefreshing={isRefreshing}
        handleUploadComplete={handleUploadComplete}
      />
      
      {permissionError && (
        <InfluencerPermissionError errorMessage={permissionError} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Influencer Listings</CardTitle>
          <CardDescription>
            View and manage all influencer listings. Total: {influencerCount} influencers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableInfluencerListings 
            onRefresh={handleRefresh} 
            onAddInfluencer={handleAddInfluencer}
            onEditInfluencer={handleEditInfluencer}
          />
        </CardContent>
      </Card>
      
      <InfluencerFormDialog 
        show={showInfluencerFormDialog}
        onClose={() => setShowInfluencerFormDialog(false)}
        influencer={currentInfluencerToEdit}
        onSubmit={handleInfluencerFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminInfluencerListingsPage;
