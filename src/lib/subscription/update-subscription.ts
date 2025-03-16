
import { Subscription, ISubscription } from '../../models/Subscription';
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
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      const errorMsg = `User document ${userId} does not exist`;
      console.error(`❌ ${errorMsg}`);
      toast({
        title: "User Not Found",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }
    
    console.log(`✅ User document exists: ${userId}`);
    
    // Explicitly check admin status - this needs to happen before any write operations
    let isAdmin = false;
    try {
      // Check current user's admin status directly
      if (auth.currentUser) {
        const adminUser = await User.findOne({ uid: auth.currentUser.uid });
        
        if (adminUser) {
          isAdmin = adminUser.isAdmin === true;
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
      updatedAt: new Date()
    };
    
    if (!subscriptionData.createdAt) {
      subscriptionWithIds.createdAt = new Date();
    }
    
    // Update or create the subscription in MongoDB
    await Subscription.findOneAndUpdate(
      { id: subscriptionId },
      subscriptionWithIds,
      { upsert: true, new: true }
    );
    
    // Update the user document with subscription summary
    await User.findOneAndUpdate(
      { uid: userId },
      {
        subscription: subscriptionId,
        subscriptionStatus: subscriptionData.status,
        subscriptionPackage: subscriptionData.packageId,
        lastUpdated: new Date(),
        ...(subscriptionData.status === "active" 
            ? { subscriptionAssignedAt: new Date() } 
            : {}),
        ...(subscriptionData.status === "cancelled" 
            ? { subscriptionCancelledAt: new Date() } 
            : {})
      }
    );
    
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
