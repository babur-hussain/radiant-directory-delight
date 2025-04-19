
import { supabase } from '@/integrations/supabase/client';
import { IUser } from '@/models/User';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a user's subscription details in the database
 */
export const updateUserSubscriptionDetails = async (
  userId: string,
  subscriptionId: string,
  packageId: string,
  status: 'active' | 'pending' | 'cancelled' | 'expired' = 'active'
): Promise<boolean> => {
  if (!userId) {
    console.error("Cannot update user subscription: No user ID provided");
    return false;
  }

  try {
    console.log(`Updating subscription details for user ${userId}:`, {
      subscriptionId,
      packageId,
      status
    });

    const { error } = await supabase
      .from('users')
      .update({
        subscription: subscriptionId,
        subscription_id: subscriptionId,
        subscription_status: status,
        subscription_package: packageId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user subscription details:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your subscription details. Please contact support.",
        variant: "destructive"
      });
      return false;
    }

    console.log("✅ Successfully updated user subscription details");
    return true;
  } catch (error) {
    console.error("Error in updateUserSubscriptionDetails:", error);
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred while updating your subscription details.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Fetches a user by ID from the database
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  if (!userId) {
    console.error("Cannot fetch user: No user ID provided");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    if (!data) return null;

    // Create an address object from the flat fields if they exist
    const address = data.address_street || data.address_state || data.address_country || data.address_zip_code
      ? {
          street: data.address_street,
          state: data.address_state,
          country: data.address_country,
          zipCode: data.address_zip_code
        }
      : undefined;

    // Convert from snake_case to camelCase and handle type conversions
    const user: IUser = {
      uid: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      isAdmin: data.is_admin,
      photoURL: data.photo_url,
      // Convert string dates to Date objects
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      lastLogin: data.last_login ? new Date(data.last_login) : new Date(),
      employeeCode: data.employee_code,
      subscription: data.subscription,
      subscriptionId: data.subscription_id,
      subscriptionStatus: data.subscription_status,
      subscriptionPackage: data.subscription_package,
      customDashboardSections: data.custom_dashboard_sections,
      
      // Shared fields
      phone: data.phone,
      instagramHandle: data.instagram_handle,
      facebookHandle: data.facebook_handle,
      verified: data.verified,
      city: data.city,
      country: data.country,
      
      // Influencer specific fields
      niche: data.niche,
      followersCount: data.followers_count,
      bio: data.bio,
      
      // Business specific fields
      businessName: data.business_name,
      ownerName: data.owner_name,
      businessCategory: data.business_category,
      website: data.website,
      address: address,
      gstNumber: data.gst_number
    };

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};
