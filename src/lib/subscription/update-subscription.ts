
import { 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc
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
    
    // Create new subscription in subscriptions subcollection
    const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
    const newSubscriptionRef = await addDoc(userSubscriptionsRef, {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Added subscription to user's subscriptions subcollection:", newSubscriptionRef.id);
    
    // Reference to the user document
    const userRef = doc(db, "users", userId);
    
    // Update the main user document with subscription summary
    await updateDoc(userRef, {
      subscription: {
        ...subscriptionData,
        id: newSubscriptionRef.id,
        updatedAt: serverTimestamp()
      },
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
    
    console.log("✅ Updated user document with subscription summary");
    
    // Also add to the main subscriptions collection for backward compatibility
    const mainSubscriptionRef = doc(db, "subscriptions", newSubscriptionRef.id);
    await setDoc(mainSubscriptionRef, {
      ...subscriptionData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Added subscription to main subscriptions collection for compatibility");
    
    return true;
  } catch (error) {
    console.error("❌ Error updating user subscription:", error);
    toast({
      title: "Update Failed",
      description: "Failed to update subscription details in database",
      variant: "destructive"
    });
    return false;
  }
};
