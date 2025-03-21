
import { ISubscription } from '../../models/Subscription';
import { User } from '../../models/User';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a user's subscription in Supabase with enhanced error handling
 */
export const updateUserSubscription = async (userId: string, subscriptionData: ISubscription) => {
  if (!userId) {
    console.error("❌ Cannot update subscription: No user ID provided");
    toast({
      title: "Update Failed",
      description: "Cannot update subscription: Missing user ID",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    console.log(`⚡ Updating subscription for user ${userId}:`, subscriptionData);
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("❌ No authenticated user found");
      throw new Error("Authentication required. Please sign in to update subscriptions.");
    }
    
    console.log(`⚡ Current user from auth:`, {
      uid: session.user.id,
      email: session.user.email
    });
    
    // First check if user document exists
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        const errorMsg = `User document ${userId} does not exist`;
        console.error(`❌ ${errorMsg}`);
        toast({
          title: "User Not Found",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(`❌ Error checking user existence:`, error);
      throw error;
    }
    
    console.log(`✅ User document exists: ${userId}`);
    
    // Explicitly check admin status - this needs to happen before any write operations
    let isAdmin = false;
    try {
      // Check current user's admin status directly
      if (session?.user) {
        const { data: adminUser, error: adminError } = await supabase
          .from('users')
          .select('is_admin, role')
          .eq('id', session.user.id)
          .single();
        
        if (!adminError && adminUser) {
          isAdmin = adminUser.is_admin === true;
          console.log(`🔐 Current user admin status:`, {
            userId: session.user.id,
            isAdmin: isAdmin,
            role: adminUser.role || 'not specified'
          });
          
          if (!isAdmin) {
            console.warn(`⚠️ User ${session.user.id} is not an admin but attempting admin operation`);
          }
        } else {
          console.warn(`⚠️ Admin user document not found for ${session.user.id}`);
        }
      }
    } catch (adminCheckError) {
      console.error("❌ Error checking admin status:", adminCheckError);
    }
    
    // Add this check for debugging purposes
    console.log(`🔍 Direct permission check: current user = ${session?.user?.id}, isAdmin = ${isAdmin}, target user = ${userId}`);
    
    // Create a new subscription ID if one doesn't exist
    const subscriptionId = subscriptionData.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Prepare subscription data with IDs
    const subscriptionWithIds = {
      ...subscriptionData,
      id: subscriptionId,
      userId: userId,
      updatedAt: new Date().toISOString()
    };
    
    if (!subscriptionData.createdAt) {
      subscriptionWithIds.createdAt = new Date().toISOString();
    }
    
    // Update or create the subscription in Supabase - FIXED: changed from 'subscriptions' to 'user_subscriptions'
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionWithIds);
      
    if (subError) {
      throw new Error(`Failed to update subscription: ${subError.message}`);
    }
    
    // Update the user document with subscription summary
    const updateData = {
      subscription: subscriptionId,
      subscription_status: subscriptionData.status,
      subscription_package: subscriptionData.packageId,
      last_updated: new Date().toISOString(),
      ...(subscriptionData.status === "active" 
          ? { subscription_assigned_at: new Date().toISOString() } 
          : {}),
      ...(subscriptionData.status === "cancelled" 
          ? { subscription_cancelled_at: new Date().toISOString() } 
          : {})
    };
    
    const { error: userUpdateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (userUpdateError) {
      console.warn(`⚠️ Failed to update user with subscription info: ${userUpdateError.message}`);
    }
    
    console.log("✅ Successfully updated subscription");
    return true;
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    
    // Format specific error messages
    let errorMessage = "Failed to update subscription";
    
    if (error instanceof Error) {
      // Get the original error message
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    // Show a toast with the user-friendly message
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};
