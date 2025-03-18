
import { 
  doc, 
  collection, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";

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
        return userData.subscription as SubscriptionData;
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
            : new Date().toISOString(),
          userId: userId,
          packageName: "Legacy Package",
          amount: 0,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        } as SubscriptionData;
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
      })) as SubscriptionData[];
      
      // Sort by createdAt descending to get the most recent
      const sortedSubscriptions = subscriptions.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
          ? a.createdAt.toDate() 
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt instanceof Timestamp 
          ? b.createdAt.toDate() 
          : new Date(b.createdAt || 0);
        
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
      })) as SubscriptionData[];
      
      // Sort by createdAt descending
      const sortedMainSubscriptions = mainSubscriptions.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
          ? a.createdAt.toDate() 
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt instanceof Timestamp 
          ? b.createdAt.toDate() 
          : new Date(b.createdAt || 0);
        
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
