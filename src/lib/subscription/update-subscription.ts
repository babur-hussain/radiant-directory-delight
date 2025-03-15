
import { 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  runTransaction,
  getDoc,
  writeBatch,
  DocumentReference
} from "firebase/firestore";
import { db, auth } from "@/config/firebase";
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
    const userRef = doc(db, "users", userId);
    let userSnap;
    
    try {
      userSnap = await getDoc(userRef);
    } catch (userFetchError) {
      console.error("❌ Error fetching user document:", userFetchError);
      throw new Error(`Error fetching user document: ${userFetchError instanceof Error ? userFetchError.message : 'Unknown error'}`);
    }
    
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
    
    // Explicitly check admin status - this needs to happen before any write operations
    let isAdmin = false;
    try {
      // Check current user's admin status directly
      if (auth.currentUser) {
        const adminUserRef = doc(db, "users", auth.currentUser.uid);
        const adminUserSnap = await getDoc(adminUserRef);
        
        if (adminUserSnap.exists()) {
          const adminData = adminUserSnap.data();
          isAdmin = adminData.isAdmin === true;
          console.log(`🔐 Current user admin status:`, {
            userId: auth.currentUser.uid,
            isAdmin: isAdmin,
            role: adminData.role || 'not specified'
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
    
    // For now, we'll proceed with the operation regardless of admin status
    // but we log detailed messages for debugging
    
    // Approach 1: Use direct set with merge (simplest approach)
    try {
      console.log("🔄 Attempting direct set with merge approach...");
      
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
      
      // Create a new subscription ID if one doesn't exist
      const subscriptionId = subscriptionData.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Create new subscription in subscriptions subcollection
      const userSubscriptionsRef = doc(collection(db, "users", userId, "subscriptions"), subscriptionId);
      
      // Prepare subscription data with IDs
      const subscriptionWithIds = {
        ...subscriptionData,
        id: subscriptionId,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to subscriptions subcollection
      await setDoc(userSubscriptionsRef, subscriptionWithIds);
      
      // Also add to the main subscriptions collection for backward compatibility
      const mainSubscriptionRef = doc(db, "subscriptions", subscriptionId);
      await setDoc(mainSubscriptionRef, {
        ...subscriptionWithIds,
        userId: userId
      });
      
      console.log("✅ Successfully updated subscription using direct set approach");
      return true;
    } catch (directSetError) {
      console.error("❌ Direct set approach failed:", directSetError);
      console.log("⚠️ Detailed set error:", directSetError instanceof Error ? directSetError.message : String(directSetError));
      console.log("⚠️ Falling back to batch write approach...");
      
      if (directSetError instanceof Error && 
          (directSetError.message.includes("permission-denied") || 
           directSetError.message.includes("Missing or insufficient permissions"))) {
        // If it's specifically a permissions error, throw it directly
        throw directSetError;
      }
    }
    
    // If we get here, the direct set approach failed - try a batch approach
    try {
      console.log("🔄 Attempting batch write approach...");
      const batch = writeBatch(db);
      
      // Generate a subscription ID
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Update the main user document with subscription summary
      batch.set(userRef, {
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
      
      // Create new subscription in subscriptions subcollection
      const userSubscriptionsRef = doc(collection(db, "users", userId, "subscriptions"), subscriptionId);
      
      // Prepare subscription data with IDs
      const subscriptionWithIds = {
        ...subscriptionData,
        id: subscriptionId,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to subscriptions subcollection
      batch.set(userSubscriptionsRef, subscriptionWithIds);
      
      // Also add to the main subscriptions collection for backward compatibility
      const mainSubscriptionRef = doc(db, "subscriptions", subscriptionId);
      batch.set(mainSubscriptionRef, {
        ...subscriptionWithIds,
        userId: userId
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log("✅ Successfully updated subscription using batch write");
      return true;
    } catch (batchError) {
      console.error("❌ Batch write approach failed:", batchError);
      console.log("⚠️ Detailed batch error:", batchError instanceof Error ? batchError.message : String(batchError));
      
      // Check specifically for permission errors and throw directly
      if (batchError instanceof Error && 
          (batchError.message.includes("permission-denied") || 
           batchError.message.includes("Missing or insufficient permissions"))) {
        throw batchError;
      }
      
      // Try one more approach with addDoc instead
      try {
        console.log("🔄 Attempting direct write approach with addDoc...");
        
        // Add to subscriptions subcollection using addDoc
        const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
        
        // Create subscription with the necessary IDs
        const subscriptionWithIds = {
          ...subscriptionData,
          userId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add the subscription record
        const newSubscriptionDoc = await addDoc(userSubscriptionsRef, subscriptionWithIds);
        console.log(`✅ Added subscription to user's subscriptions subcollection with ID: ${newSubscriptionDoc.id}`);
        
        // Update the main user document
        await setDoc(userRef, {
          subscription: {
            ...subscriptionData,
            id: newSubscriptionDoc.id
          },
          subscriptionStatus: subscriptionData.status,
          subscriptionPackage: subscriptionData.packageId,
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        console.log("✅ Successfully updated subscription using addDoc approach");
        return true;
      } catch (finalError) {
        console.error("❌ All approaches to update subscription failed");
        throw finalError;
      }
    }
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    
    // Format specific error messages
    let errorMessage = "Failed to update subscription";
    
    if (error instanceof Error) {
      // Get the original error message
      errorMessage = `${errorMessage}: ${error.message}`;
      
      if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
        errorMessage = "Permission denied. You don't have admin rights to update subscriptions.";
        console.error("🔒 This is a permissions issue. Check Firebase rules and user authentication.");
      } else if (error.message.includes("not-found")) {
        errorMessage = "User document not found. Please refresh and try again.";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "Firebase service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes("failed-precondition")) {
        errorMessage = "Operation failed. This might be due to a missing index or conflicting operations.";
      }
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
