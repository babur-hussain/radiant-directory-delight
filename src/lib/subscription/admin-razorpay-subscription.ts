
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced subscription management utility for admin operations
 * Supports advanced payment structure with Razorpay integration
 */
export interface AdminSubscriptionParams {
  userId: string;
  packageData: any;
  advancePaymentMonths: number;
  signupFee: number;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  notes?: Record<string, string>;
}

export const adminCreateRazorpaySubscription = async (params: AdminSubscriptionParams): Promise<boolean> => {
  try {
    console.log(`🔰 Admin creating advanced subscription for user ${params.userId}`, params);
    
    // Generate a unique subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate dates
    const startDate = new Date();
    
    // Calculate the actual start date after advance payment period
    const actualStartDate = new Date();
    actualStartDate.setMonth(actualStartDate.getMonth() + params.advancePaymentMonths);
    
    // Calculate end date (1 year after actual start date)
    const endDate = new Date(actualStartDate);
    endDate.setMonth(endDate.getMonth() + params.packageData.durationMonths);
    
    // Create subscription data
    const subscriptionData: SubscriptionData = {
      id: subscriptionId,
      userId: params.userId,
      packageId: params.packageData.id,
      packageName: params.packageData.title,
      amount: params.packageData.price,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // New advanced payment fields
      advancePaymentMonths: params.advancePaymentMonths,
      signupFee: params.signupFee,
      actualStartDate: actualStartDate.toISOString(),
      isPaused: false,
      isPausable: params.isPausable ?? false,
      isUserCancellable: params.isUserCancellable ?? false,
      invoiceIds: []
    };
    
    // Step 1: Check if user exists
    const userRef = doc(db, "users", params.userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${params.userId} does not exist`);
    }
    
    console.log("✅ User exists, proceeding with subscription assignment");
    
    // Step 2: Create a batch-like operation by using individual promises
    const updatePromises = [];
    
    // Update the user document with subscription info
    updatePromises.push(
      updateDoc(userRef, {
        subscription: subscriptionData,
        subscriptionStatus: "active",
        subscriptionPackage: params.packageData.id,
        updatedAt: serverTimestamp(),
        subscriptionAssignedAt: serverTimestamp(),
        // Add advanced payment details to user record
        subscriptionAdvanceMonths: params.advancePaymentMonths,
        subscriptionActualStartDate: actualStartDate,
        subscriptionSignupFee: params.signupFee
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
    const userSubscriptionRef = doc(db, "users", params.userId, "subscriptions", subscriptionId);
    updatePromises.push(
      setDoc(userSubscriptionRef, {
        ...subscriptionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    // Execute all promises
    await Promise.all(updatePromises);
    
    // Step 3: In a real implementation, we would call Razorpay API here
    // to create the subscription with advance payment and auto-debits
    
    console.log("✅ Advanced subscription assignment successful");
    return true;
  } catch (error) {
    console.error("❌ Error in adminCreateRazorpaySubscription:", error);
    
    let errorMessage = "Failed to create advanced subscription";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    toast({
      title: "Subscription Creation Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};

export const adminPauseSubscription = async (userId: string, subscriptionId: string, adminId: string): Promise<boolean> => {
  try {
    console.log(`🔰 Admin pausing subscription ${subscriptionId} for user ${userId}`);
    
    // Step 1: Verify user and subscription exist
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }
    
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }
    
    const subscriptionData = subscriptionDoc.data() as SubscriptionData;
    
    // Check if this subscription can be paused
    if (!subscriptionData.isPausable) {
      throw new Error(`This subscription does not support pausing`);
    }
    
    // Update subscription data
    const updatedSubscription = {
      ...subscriptionData,
      isPaused: true,
      pausedAt: new Date().toISOString(),
      pausedBy: adminId,
      status: "paused",
      updatedAt: new Date().toISOString()
    };
    
    // Update all relevant documents
    const updatePromises = [];
    
    // Update main subscription document
    updatePromises.push(setDoc(subscriptionRef, updatedSubscription));
    
    // Update user's subscription subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    updatePromises.push(setDoc(userSubscriptionRef, updatedSubscription, { merge: true }));
    
    // Update user document
    updatePromises.push(updateDoc(userRef, {
      subscription: updatedSubscription,
      subscriptionStatus: "paused",
      subscriptionPausedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    // Here you would also call Razorpay API to pause the subscription
    
    console.log("✅ Subscription paused successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in adminPauseSubscription:", error);
    
    let errorMessage = "Failed to pause subscription";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    toast({
      title: "Pause Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};

export const adminResumeSubscription = async (userId: string, subscriptionId: string, adminId: string): Promise<boolean> => {
  try {
    console.log(`🔰 Admin resuming subscription ${subscriptionId} for user ${userId}`);
    
    // Verify user and subscription exist
    const userRef = doc(db, "users", userId);
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    
    const [userDoc, subscriptionDoc] = await Promise.all([
      getDoc(userRef),
      getDoc(subscriptionRef)
    ]);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} does not exist`);
    }
    
    if (!subscriptionDoc.exists()) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }
    
    const subscriptionData = subscriptionDoc.data() as SubscriptionData;
    
    // Check if subscription is actually paused
    if (!subscriptionData.isPaused) {
      throw new Error(`This subscription is not paused`);
    }
    
    // Update subscription data
    const updatedSubscription = {
      ...subscriptionData,
      isPaused: false,
      resumedAt: new Date().toISOString(),
      resumedBy: adminId,
      status: "active",
      updatedAt: new Date().toISOString()
    };
    
    // Update all relevant documents
    const updatePromises = [];
    
    // Update main subscription document
    updatePromises.push(setDoc(subscriptionRef, updatedSubscription));
    
    // Update user's subscription subcollection
    const userSubscriptionRef = doc(db, "users", userId, "subscriptions", subscriptionId);
    updatePromises.push(setDoc(userSubscriptionRef, updatedSubscription, { merge: true }));
    
    // Update user document
    updatePromises.push(updateDoc(userRef, {
      subscription: updatedSubscription,
      subscriptionStatus: "active",
      subscriptionResumedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    // Here you would also call Razorpay API to resume the subscription
    
    console.log("✅ Subscription resumed successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in adminResumeSubscription:", error);
    
    let errorMessage = "Failed to resume subscription";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    toast({
      title: "Resume Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    return false;
  }
};
