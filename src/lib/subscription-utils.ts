
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "@/hooks/use-toast";

/**
 * Updates a user's subscription in Firestore
 */
export const updateUserSubscription = async (userId: string, subscriptionData: any) => {
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

/**
 * Gets a user's current subscription from Firestore
 */
export const getUserSubscription = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Get user document to check for subscription summary
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check for subscription in user document
      if (userData?.subscription) {
        console.log("✅ Found subscription in user document:", userData.subscription);
        return userData.subscription;
      }
      
      // Check for legacy subscription fields
      if (userData?.subscriptionStatus) {
        console.log("✅ Found legacy subscription fields in user document");
        
        // Create a subscription object from legacy fields
        return {
          packageId: userData.subscriptionPackage,
          status: userData.subscriptionStatus,
          startDate: userData.subscriptionAssignedAt 
            ? new Date(userData.subscriptionAssignedAt.toDate()).toISOString() 
            : new Date().toISOString()
        };
      }
    }
    
    // If not found in user document, check subscriptions subcollection
    const userSubscriptionsRef = collection(db, "users", userId, "subscriptions");
    const subscriptionsQuery = query(
      userSubscriptionsRef, 
      where("status", "==", "active")
    );
    
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    if (!subscriptionsSnapshot.empty) {
      // Get the most recent active subscription
      const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt descending to get the most recent
      const sortedSubscriptions = subscriptions.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
          ? a.createdAt.toDate() 
          : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Timestamp 
          ? b.createdAt.toDate() 
          : new Date(b.createdAt);
        
        return dateB.getTime() - dateA.getTime();
      });
      
      const latestSubscription = sortedSubscriptions[0];
      console.log("✅ Found subscription in subscriptions subcollection:", latestSubscription);
      
      // Update user document with this subscription
      await updateDoc(userRef, {
        subscription: latestSubscription,
        subscriptionStatus: latestSubscription.status,
        subscriptionPackage: latestSubscription.packageId,
        lastUpdated: serverTimestamp()
      });
      
      return latestSubscription;
    }
    
    // As a last resort, check the main subscriptions collection
    const mainSubscriptionsQuery = query(
      collection(db, "subscriptions"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    
    const mainSubscriptionsSnapshot = await getDocs(mainSubscriptionsQuery);
    
    if (!mainSubscriptionsSnapshot.empty) {
      const mainSubscriptions = mainSubscriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt descending
      const sortedMainSubscriptions = mainSubscriptions.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
          ? a.createdAt.toDate() 
          : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Timestamp 
          ? b.createdAt.toDate() 
          : new Date(b.createdAt);
        
        return dateB.getTime() - dateA.getTime();
      });
      
      const latestMainSubscription = sortedMainSubscriptions[0];
      console.log("✅ Found subscription in main subscriptions collection:", latestMainSubscription);
      
      // Update user document with this subscription
      await updateDoc(userRef, {
        subscription: latestMainSubscription,
        subscriptionStatus: latestMainSubscription.status,
        subscriptionPackage: latestMainSubscription.packageId,
        lastUpdated: serverTimestamp()
      });
      
      return latestMainSubscription;
    }
    
    console.log("❌ No subscription found for user", userId);
    return null;
  } catch (error) {
    console.error("❌ Error getting user subscription:", error);
    return null;
  }
};

/**
 * Set up a real-time listener for a user's subscription
 */
export const listenToUserSubscription = (
  userId: string,
  onUpdate: (subscription: any) => void,
  onError: (error: any) => void
) => {
  if (!userId) return () => {};
  
  // Listen to the user document for subscription changes
  const userRef = doc(db, "users", userId);
  const unsubscribe = onSnapshot(userRef, 
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData?.subscription) {
          onUpdate(userData.subscription);
        } else if (userData?.subscriptionStatus) {
          // Handle legacy format
          const subscription = {
            packageId: userData.subscriptionPackage,
            status: userData.subscriptionStatus,
            startDate: userData.subscriptionAssignedAt 
              ? new Date(userData.subscriptionAssignedAt.toDate()).toISOString() 
              : new Date().toISOString()
          };
          onUpdate(subscription);
        } else {
          onUpdate(null);
        }
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error listening to user subscription:", error);
      onError(error);
    }
  );
  
  return unsubscribe;
};
