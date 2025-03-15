
import { 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  runTransaction
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "@/hooks/use-toast";
import { SubscriptionData } from "./types";

/**
 * Updates a user's subscription in Firestore
 */
export const updateUserSubscription = async (userId: string, subscriptionData: SubscriptionData) => {
  if (!userId) {
    console.error("❌ Cannot update subscription: No user ID provided");
    return false;
  }
  
  try {
    console.log(`⚡ Updating subscription for user ${userId}:`, subscriptionData);
    
    // Use a transaction to ensure data consistency across collections
    await runTransaction(db, async (transaction) => {
      // Reference to the user document
      const userRef = doc(db, "users", userId);
      
      // Create new subscription in subscriptions subcollection
      const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
      const newSubscriptionRef = doc(userSubscriptionsRef);
      
      // Prepare subscription data with IDs
      const subscriptionWithIds = {
        ...subscriptionData,
        id: newSubscriptionRef.id,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Create in subscriptions subcollection
      transaction.set(newSubscriptionRef, subscriptionWithIds);
      
      // Update the main user document with subscription summary
      transaction.update(userRef, {
        subscription: subscriptionWithIds,
        subscriptionStatus: subscriptionData.status,
        subscriptionPackage: subscriptionData.packageId,
        lastUpdated: serverTimestamp(),
        ...(subscriptionData.status === "active" 
            ? { subscriptionAssignedAt: serverTimestamp() } 
            : {}),
        ...(subscriptionData.status === "cancelled" 
            ? { subscriptionCancelledAt: serverTimestamp() } 
            : {})
      });
      
      // Also add to the main subscriptions collection for backward compatibility
      const mainSubscriptionRef = doc(db, "subscriptions", newSubscriptionRef.id);
      transaction.set(mainSubscriptionRef, {
        ...subscriptionWithIds,
        userId: userId
      });
    });
    
    console.log("✅ Successfully updated subscription in all collections");
    return true;
  } catch (error) {
    console.error("❌ Error updating user subscription:", error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = "Failed to update subscription details in database";
    
    if (error instanceof Error) {
      if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
        errorMessage = "You don't have permission to update subscriptions. Check your admin rights.";
      } else if (error.message.includes("not-found")) {
        errorMessage = "User not found. Please refresh and try again.";
      }
      
      // Log the detailed error for debugging
      console.error(`💥 Detailed error: ${error.message}`);
    }
    
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive"
    });
    return false;
  }
};
