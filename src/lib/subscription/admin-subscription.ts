
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
    
    // Create subscription data
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
      updatedAt: new Date().toISOString()
    };
    
    // Step 1: Check if user exists
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }
    
    // Step 2: Update the user document with subscription info
    await updateDoc(userRef, {
      subscriptionData: subscriptionData,
      subscriptionStatus: "active",
      subscriptionPackage: packageData.id,
      updatedAt: serverTimestamp()
    });
    
    // Step 3: Create a new subscription document in subscriptions collection
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await setDoc(subscriptionRef, {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Step 4: Also add to user's subscriptions subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    await setDoc(userSubscriptionRef, {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
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
    
    // Step 1: Get the current subscription
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error(`Subscription ${subscriptionId} does not exist`);
    }
    
    const subscriptionData = subscriptionDoc.data() as SubscriptionData;
    
    // Step 2: Update the subscription with cancelled status
    const updatedSubscription = {
      ...subscriptionData,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update in main subscriptions collection
    await setDoc(subscriptionRef, updatedSubscription);
    
    // Update in user's subscriptions subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    await setDoc(userSubscriptionRef, updatedSubscription);
    
    // Update user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      subscriptionStatus: "cancelled",
      subscriptionCancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
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
