
import { 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  runTransaction,
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "@/hooks/use-toast";
import { SubscriptionData } from "./types";

/**
 * Updates a user's subscription in Firestore with enhanced error handling
 */
export const updateUserSubscription = async (userId: string, subscriptionData: SubscriptionData) => {
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
    console.log(`⚡ Current user from auth:`, JSON.stringify(window.auth?.currentUser || {}));
    
    // First check if user document exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
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
    
    // Try multiple approaches to ensure we can update the subscription
    // Approach 1: Use batch writes - often more successful with permission issues
    try {
      console.log("🔄 Attempting batch write approach...");
      const batch = writeBatch(db);
      
      // Update the main user document with subscription summary
      batch.update(userRef, {
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
      });
      
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
      
      // Add to subscriptions subcollection
      batch.set(newSubscriptionRef, subscriptionWithIds);
      
      // Also add to the main subscriptions collection for backward compatibility
      const mainSubscriptionRef = doc(db, "subscriptions", newSubscriptionRef.id);
      batch.set(mainSubscriptionRef, {
        ...subscriptionWithIds,
        userId: userId
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log("✅ Successfully updated subscription using batch write");
      toast({
        title: "Subscription Updated",
        description: `Successfully updated subscription to ${subscriptionData.packageId}`,
        variant: "success"
      });
      return true;
    } catch (batchError) {
      console.error("❌ Batch write approach failed:", batchError);
      console.log("⚠️ Detailed batch error:", batchError instanceof Error ? batchError.message : String(batchError));
      console.log("⚠️ Falling back to transaction approach...");
    }
    
    // Approach 2: Use transaction approach
    try {
      console.log("🔄 Attempting transaction approach...");
      await runTransaction(db, async (transaction) => {
        // Reference to the user document
        const userRef = doc(db, "users", userId);
        
        // Get the current user data to verify it exists
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error(`User document ${userId} does not exist in transaction`);
        }
        
        // Update the main user document with subscription summary
        transaction.update(userRef, {
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
        });
        
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
        
        // Also add to the main subscriptions collection for backward compatibility
        const mainSubscriptionRef = doc(db, "subscriptions", newSubscriptionRef.id);
        transaction.set(mainSubscriptionRef, {
          ...subscriptionWithIds,
          userId: userId
        });
      });
      
      console.log("✅ Successfully updated subscription using transaction");
      toast({
        title: "Subscription Updated",
        description: `Successfully updated subscription to ${subscriptionData.packageId}`,
        variant: "success"
      });
      return true;
    } catch (transactionError) {
      console.error("❌ Transaction approach failed:", transactionError);
      console.log("⚠️ Detailed transaction error:", transactionError instanceof Error ? transactionError.message : String(transactionError));
      console.log("⚠️ Falling back to direct write approach...");
    }
    
    // Approach 3: Fall back to a more basic approach - set with merge option
    console.log("🔄 Attempting direct write approach...");
    
    // Add to subscriptions subcollection
    const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
    const subscriptionWithIds = {
      ...subscriptionData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      // First try to update the user document with setDoc and merge
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
      
      // If user document updated successfully, add the subscription
      const newSubscriptionDoc = await addDoc(userSubscriptionsRef, subscriptionWithIds);
      console.log(`✅ Added subscription to user's subscriptions subcollection with ID: ${newSubscriptionDoc.id}`);
      
      // For backward compatibility - add to main subscriptions collection
      const mainSubscriptionRef = doc(collection(db, "subscriptions"), newSubscriptionDoc.id);
      await setDoc(mainSubscriptionRef, {
        ...subscriptionWithIds,
        id: mainSubscriptionRef.id,
        userId: userId
      });
      
      console.log("✅ Successfully updated subscription using direct write approach");
      
      // Show success toast
      toast({
        title: "Subscription Updated",
        description: `Successfully updated subscription to ${subscriptionData.packageId}`,
        variant: "success"
      });
      
      return true;
    } catch (directWriteError) {
      console.error("❌ Direct write approach failed:", directWriteError);
      throw directWriteError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("❌ All approaches to update subscription failed:", error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = "Failed to update subscription details in database";
    let errorDetails = "";
    
    if (error instanceof Error) {
      // Get the full error message and stack
      errorDetails = `${error.message}\n${error.stack || ''}`;
      console.error(`💥 CRITICAL ERROR: ${errorDetails}`);
      
      if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
        errorMessage = "Permission denied. The current user doesn't have permission to update subscriptions. Admin rights may be required.";
        console.error("🔒 This is a permissions issue. Check Firebase rules and user authentication.");
        
        // Try to log current auth state for debugging
        try {
          if (window.firebase && window.firebase.auth) {
            const currentUser = window.firebase.auth().currentUser;
            console.log("🔑 Current Firebase user:", currentUser ? JSON.stringify(currentUser) : "No user logged in");
          }
        } catch (authError) {
          console.error("Failed to log auth state:", authError);
        }
      } else if (error.message.includes("not-found")) {
        errorMessage = "User document not found. Please refresh and try again.";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "Firebase service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes("failed-precondition")) {
        errorMessage = "Operation failed. This might be due to a missing index or conflicting operations.";
        console.error("⚠️ This could indicate a missing Firestore index. Check console for index creation link.");
      } else if (error.message.includes("resource-exhausted")) {
        errorMessage = "Firebase quota exceeded. Please try again later.";
      } else {
        // If we have a specific error message, use it
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    // Show a toast with both the user-friendly message and technical details
    toast({
      title: "Update Failed",
      description: `${errorMessage}\n\nTechnical details: ${errorDetails}`,
      variant: "destructive"
    });
    return false;
  }
};
