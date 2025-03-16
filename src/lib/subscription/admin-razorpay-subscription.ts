
// This file needs updating to include paymentType
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SubscriptionData } from "./types";

export const adminAssignRazorpaySubscription = async (userId: string, packageDetails: any, paymentDetails: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Invalid user ID");
      return false;
    }
    
    if (!packageDetails) {
      console.error("Invalid package details");
      return false;
    }
    
    // Generate a unique subscription ID
    const subscriptionId = `sub_${Date.now()}`;
    
    const isOneTime = packageDetails.paymentType === "one-time";
    
    // Calculate end date based on package duration or default to 1 year
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (packageDetails.durationMonths || 12));
    
    // Prepare subscription data
    const subscription: SubscriptionData = {
      id: subscriptionId,
      userId: userId,
      packageId: packageDetails.id,
      packageName: packageDetails.title,
      amount: packageDetails.price,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      assignedBy: "admin",
      assignedAt: new Date().toISOString(),
      advancePaymentMonths: packageDetails.advancePaymentMonths || 0,
      signupFee: packageDetails.setupFee || 0,
      actualStartDate: new Date().toISOString(),
      isPaused: false,
      isPausable: !isOneTime,
      isUserCancellable: !isOneTime,
      invoiceIds: [],
      paymentType: packageDetails.paymentType || "recurring"
    };
    
    // Add payment details if provided
    if (paymentDetails) {
      subscription.paymentMethod = "razorpay";
      subscription.transactionId = paymentDetails.paymentId;
      subscription.razorpaySubscriptionId = paymentDetails.subscriptionId;
    }
    
    // Set the document in Firestore
    const docRef = doc(db, "subscriptions", subscriptionId);
    await setDoc(docRef, subscription);
    
    console.log(`Razorpay subscription ${subscriptionId} assigned to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error assigning Razorpay subscription:", error);
    return false;
  }
};
