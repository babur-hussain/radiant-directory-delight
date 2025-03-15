
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * A simplified subscription management utility for admin operations
 * Designed to work with more permissive Firestore rules
 */
export const adminAssignSubscription = async (userId: string, packageData: any): Promise<boolean> => {
  try {
    console.log(`🔰 Admin assigning subscription to user ${userId}`, packageData);
    
    // Generate a unique subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create subscription data with default values for new required fields
    const subscriptionData: SubscriptionData = {
      id: subscriptionId,
      userId: userId,
      packageId: packageData.id,
      packageName: packageData.title,
      amount: packageData.price,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + packageData.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add default values for required fields
      advancePaymentMonths: 6, // Default to 6 months advance payment
      signupFee: 0,
      actualStartDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Start after 6 months
      isPaused: false,
      isPausable: true, // Admin can pause
      isUserCancellable: false, // Users cannot cancel
      invoiceIds: []
    };
    
    // Step 1: Check if user exists
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }
    
    console.log("✅ User exists, proceeding with subscription assignment");
    
    // Step 2: Create a batch-like operation by using individual promises
    const updatePromises = [];
    
    // Update the user document with subscription info
    updatePromises.push(
      updateDoc(userRef, {
        subscription: subscriptionData,
        subscriptionStatus: "active",
        subscriptionPackage: packageData.id,
        updatedAt: serverTimestamp(),
        subscriptionAssignedAt: serverTimestamp()
      })
    );
    
    // Create a new subscription document in subscriptions collection
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    updatePromises.push(
      setDoc(subscriptionRef, {
        ...subscriptionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    // Add to user's subscriptions subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    updatePromises.push(
      setDoc(userSubscriptionRef, {
        ...subscriptionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    // Execute all promises
    await Promise.all(updatePromises);
    
    console.log("✅ Subscription assignment successful");
    return true;
  } catch (error) {
    console.error("❌ Error in adminAssignSubscription:", error);
    
    let errorMessage = "Failed to assign subscription";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    toast({
      title: "Subscription Assignment Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};

export const adminCancelSubscription = async (userId: string, subscriptionId: string): Promise<boolean> => {
  try {
    console.log(`🔰 Admin cancelling subscription ${subscriptionId} for user ${userId}`);
    
    // Step 1: Verify user exists
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }
    
    console.log("✅ User exists, proceeding with subscription cancellation");
    
    // Step 2: Get the current subscription if it exists
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    let subscriptionData: SubscriptionData | null = null;
    
    if (subscriptionDoc.exists()) {
      subscriptionData = subscriptionDoc.data() as SubscriptionData;
    } else {
      // If not found in subscriptions collection, check in the user's subscriptions subcollection
      const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
      const userSubscriptionDoc = await getDoc(userSubscriptionRef);
      
      if (!userSubscriptionDoc.exists()) {
        // If we still can't find it, check the user document itself
        const userData = userDoc.data();
        if (userData?.subscription?.id === subscriptionId) {
          subscriptionData = userData.subscription as SubscriptionData;
        } else {
          throw new Error(`Subscription ${subscriptionId} not found for user ${userId}`);
        }
      } else {
        subscriptionData = userSubscriptionDoc.data() as SubscriptionData;
      }
    }
    
    if (!subscriptionData) {
      throw new Error(`No valid subscription data found for ID ${subscriptionId}`);
    }
    
    console.log("✅ Found subscription data:", subscriptionData);
    
    // Step 3: Prepare updated subscription with cancelled status
    const updatedSubscription = {
      ...subscriptionData,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Step 4: Update all relevant documents in a Promise.all pattern
    const updatePromises = [];
    
    // Update in main subscriptions collection if it exists
    if (subscriptionDoc.exists()) {
      updatePromises.push(setDoc(subscriptionRef, updatedSubscription));
    }
    
    // Update in user's subscriptions subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    updatePromises.push(setDoc(userSubscriptionRef, updatedSubscription, { merge: true }));
    
    // Update user document
    updatePromises.push(updateDoc(userRef, {
      subscription: updatedSubscription,
      subscriptionStatus: "cancelled",
      subscriptionCancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    
    // Execute all promises
    await Promise.all(updatePromises);
    
    console.log("✅ Subscription cancellation successful");
    return true;
  } catch (error) {
    console.error("❌ Error in adminCancelSubscription:", error);
    
    let errorMessage = "Failed to cancel subscription";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    toast({
      title: "Subscription Cancellation Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};
