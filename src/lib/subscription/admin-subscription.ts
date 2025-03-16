
// This file needs updating to include paymentType
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";

export const adminAssignSubscription = async (userId: string, subscriptionData: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Invalid user ID");
      return false;
    }
    
    // Generate a unique subscription ID if not provided
    const subscriptionId = subscriptionData.id || `sub_${Date.now()}`;
    
    // Prepare subscription data
    const subscription: SubscriptionData = {
      id: subscriptionId,
      userId: userId,
      packageId: subscriptionData.packageId || subscriptionData.id,
      packageName: subscriptionData.packageName || subscriptionData.title,
      amount: subscriptionData.amount || subscriptionData.price,
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: subscriptionData.status || "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      assignedBy: subscriptionData.assignedBy || "admin",
      assignedAt: subscriptionData.assignedAt || new Date().toISOString(),
      advancePaymentMonths: subscriptionData.advancePaymentMonths || 0,
      signupFee: subscriptionData.signupFee || 0,
      actualStartDate: subscriptionData.actualStartDate || new Date().toISOString(),
      isPaused: subscriptionData.isPaused || false,
      isPausable: subscriptionData.isPausable !== undefined ? subscriptionData.isPausable : true,
      isUserCancellable: subscriptionData.isUserCancellable !== undefined ? subscriptionData.isUserCancellable : true,
      invoiceIds: subscriptionData.invoiceIds || [],
      paymentType: subscriptionData.paymentType || "recurring" // Default to recurring if not specified
    };
    
    // Set the document in Firestore
    const docRef = doc(db, "subscriptions", subscriptionId);
    await setDoc(docRef, subscription);
    
    console.log(`Subscription ${subscriptionId} assigned to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error assigning subscription:", error);
    return false;
  }
};

// Adding this function to fix reference errors
export const adminCancelSubscription = async (userId: string, subscriptionId: string): Promise<boolean> => {
  try {
    if (!userId || !subscriptionId) {
      console.error("Invalid user ID or subscription ID");
      return false;
    }
    
    // Get the subscription document
    const docRef = doc(db, "subscriptions", subscriptionId);
    
    // Update with cancelled status
    await setDoc(docRef, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: "admin_cancelled",
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log(`Subscription ${subscriptionId} cancelled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};
