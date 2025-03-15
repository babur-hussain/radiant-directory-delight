
import { 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  runTransaction,
  getDoc
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
    
    // First check if user document exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`❌ User document ${userId} does not exist`);
      throw new Error("User document does not exist");
    }
    
    console.log(`✅ User document exists: ${userId}`);
    
    // Start with a more basic approach - set with merge option
    // This is less likely to fail compared to transactions
    try {
      // Update the main user document with subscription summary
      await setDoc(userRef, {
        subscription: subscriptionData,
        subscriptionStatus: subscriptionData.status,
        subscriptionPackage: subscriptionData.packageId,
        lastUpdated: serverTimestamp(),
        ...(subscriptionData.status === "active" 
            ? { subscriptionAssignedAt: serverTimestamp() } 
            : {}),
        ...(subscriptionData.status === "cancelled" 
            ? { subscriptionCancelledAt: serverTimestamp() } 
            : {})
      }, { merge: true });
      
      console.log(`✅ Successfully updated main user document with subscription info`);
      
      // Add to subscriptions subcollection
      const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
      const subscriptionWithIds = {
        ...subscriptionData,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(userSubscriptionsRef, subscriptionWithIds);
      console.log(`✅ Added subscription to user's subscriptions subcollection`);
      
      // For backward compatibility - add to main subscriptions collection
      const mainSubscriptionRef = doc(collection(db, "subscriptions"));
      await setDoc(mainSubscriptionRef, {
        ...subscriptionWithIds,
        id: mainSubscriptionRef.id,
        userId: userId
      });
      
      console.log("✅ Successfully updated subscription in all collections");
      return true;
    } catch (directWriteError) {
      console.error("❌ Direct write approach failed:", directWriteError);
      console.log("⚠️ Falling back to transaction approach...");
      
      // Fall back to transaction if direct writes fail
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
      
      console.log("✅ Successfully updated subscription using transaction fallback");
      return true;
    }
  } catch (error) {
    console.error("❌ Error updating user subscription:", error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = "Failed to update subscription details in database";
    
    if (error instanceof Error) {
      // Log the detailed error for debugging
      console.error(`💥 Detailed error: ${error.message}`);
      
      if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
        errorMessage = "Permission denied. The current user doesn't have permission to update subscriptions. Admin rights may be required.";
        console.error("🔒 This is a permissions issue. Check Firebase rules and user authentication.");
      } else if (error.message.includes("not-found")) {
        errorMessage = "User document not found. Please refresh and try again.";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "Firebase service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes("failed-precondition")) {
        errorMessage = "Operation failed. This might be due to a missing index or conflicting operations.";
        console.error("⚠️ This could indicate a missing Firestore index. Check console for index creation link.");
      }
    }
    
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive"
    });
    return false;
  }
};
