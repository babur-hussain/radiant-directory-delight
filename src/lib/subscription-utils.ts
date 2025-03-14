
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "@/hooks/use-toast";
import { syncUserData } from "@/features/auth/authStorage";

/**
 * Updates a user's subscription in both Firestore and localStorage
 */
export const updateUserSubscription = async (userId: string, subscriptionData: any) => {
  if (!userId) {
    console.error("❌ Cannot update subscription: No user ID provided");
    return false;
  }
  
  try {
    console.log(`⚡ Updating subscription for user ${userId}:`, subscriptionData);
    
    // First try setDoc with merge option for reliable updates
    const userRef = doc(db, "users", userId);
    
    // Create the update data including both the main subscription object and legacy fields
    const updateData: any = {
      subscription: subscriptionData,
      subscriptionPackage: subscriptionData.packageId,
      subscriptionStatus: subscriptionData.status,
      lastUpdated: serverTimestamp()
    };
    
    // Add appropriate timestamp fields based on status
    if (subscriptionData.status === "active") {
      updateData.subscriptionAssignedAt = serverTimestamp();
    } else if (subscriptionData.status === "cancelled") {
      updateData.subscriptionCancelledAt = serverTimestamp();
    }
    
    try {
      // First attempt with setDoc and merge
      await setDoc(userRef, updateData, { merge: true });
      console.log("✅ Subscription updated in Firestore using setDoc with merge");
      
      // Verify the update worked
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        console.log("📊 Verified Firestore update:", {
          subscription: data.subscription,
          subscriptionStatus: data.subscriptionStatus
        });
      }
    } catch (firestoreError) {
      console.error("❌ setDoc failed, trying updateDoc:", firestoreError);
      
      // Second attempt with updateDoc as fallback
      try {
        await updateDoc(userRef, updateData);
        console.log("✅ Subscription updated in Firestore using updateDoc");
      } catch (updateError) {
        console.error("❌ Both update methods failed:", updateError);
        throw updateError; // Re-throw to be caught by outer try-catch
      }
    }
    
    // Update localStorage as backup
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    userSubscriptions[userId] = subscriptionData;
    localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
    
    // Also update in the user's auth record using syncUserData
    await syncUserData(userId, {
      subscription: subscriptionData,
      subscriptionPackage: subscriptionData.packageId,
      subscriptionStatus: subscriptionData.status,
      lastUpdated: new Date().toISOString()
    });
    
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

/**
 * Gets a user's current subscription from Firestore and localStorage
 */
export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Try to get from Firestore first
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("📊 User data from Firestore:", userData);
      
      // Check for subscription in various places
      if (userData?.subscription) {
        console.log("✅ Found subscription object in Firestore");
        return userData.subscription;
      } else if (userData?.subscriptionPackage) {
        console.log("✅ Found legacy subscription fields in Firestore");
        // Construct a subscription object from legacy fields
        return {
          packageId: userData.subscriptionPackage,
          status: userData.subscriptionStatus || "active",
          startDate: userData.subscriptionAssignedAt || new Date().toISOString()
        };
      }
    }
    
    // Fall back to localStorage
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    const subscription = userSubscriptions[userId];
    
    if (subscription) {
      console.log("✅ Found subscription in localStorage:", subscription);
      
      // If found in localStorage but not in Firestore, sync it back to Firestore
      await updateUserSubscription(userId, subscription);
      
      return subscription;
    }
    
    console.log("❌ No subscription found for user", userId);
    return null;
  } catch (error) {
    console.error("❌ Error getting user subscription:", error);
    
    // Last resort - try localStorage
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    return userSubscriptions[userId] || null;
  }
};
