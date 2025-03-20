
import { ISubscription } from '../../models/Subscription';
import { User } from '../../models/User';
import { auth } from '@/config/firebase';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a user's subscription in MongoDB with enhanced error handling
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
    if (!auth.currentUser) {
      console.error("❌ No authenticated user found");
      throw new Error("Authentication required. Please sign in to update subscriptions.");
    }
    
    console.log(`⚡ Current user from auth:`, {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email
    });
    
    // First check if user document exists
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      if (!response.ok) {
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
      if (auth.currentUser) {
        const adminCheckResponse = await fetch(`http://localhost:3001/api/users/${auth.currentUser.uid}`);
        
        if (adminCheckResponse.ok) {
          const adminUser = await adminCheckResponse.json();
          isAdmin = adminUser.is_admin === true;
          console.log(`🔐 Current user admin status:`, {
            userId: auth.currentUser.uid,
            isAdmin: isAdmin,
            role: adminUser.role || 'not specified'
          });
          
          if (!isAdmin) {
            console.warn(`⚠️ User ${auth.currentUser.uid} is not an admin but attempting admin operation`);
          }
        } else {
          console.warn(`⚠️ Admin user document not found for ${auth.currentUser.uid}`);
        }
      }
    } catch (adminCheckError) {
      console.error("❌ Error checking admin status:", adminCheckError);
    }
    
    // Add this check for debugging purposes
    console.log(`🔍 Direct permission check: current user = ${auth.currentUser?.uid}, isAdmin = ${isAdmin}, target user = ${userId}`);
    
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
    
    // Update or create the subscription through API
    const response = await fetch('http://localhost:3001/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionWithIds),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.statusText}`);
    }
    
    // Update the user document with subscription summary
    const userUpdateResponse = await fetch(`http://localhost:3001/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });
    
    if (!userUpdateResponse.ok) {
      console.warn(`⚠️ Failed to update user with subscription info: ${userUpdateResponse.statusText}`);
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
