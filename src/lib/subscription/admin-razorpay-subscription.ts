
import { SubscriptionData } from "./types";
import axios from 'axios';

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
    
    // Generate a unique subscription ID if not provided
    const subscriptionId = paymentDetails?.subscriptionId || `sub${Date.now()}`;
    
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
      amount: isOneTime ? packageDetails.price : packageDetails.setupFee,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedBy: "user",
      assignedAt: new Date().toISOString(),
      advancePaymentMonths: packageDetails.advancePaymentMonths || 0,
      signupFee: packageDetails.setupFee || 0,
      actualStartDate: new Date().toISOString(),
      isPaused: false,
      isPausable: !isOneTime,
      isUserCancellable: !isOneTime,
      invoiceIds: [],
      paymentType: packageDetails.paymentType || "recurring",
      billingCycle: packageDetails.billingCycle,
      recurringAmount: isOneTime ? 0 : packageDetails.price
    };
    
    // Add payment details if provided
    if (paymentDetails) {
      subscription.paymentMethod = "razorpay";
      subscription.transactionId = paymentDetails.razorpay_payment_id || paymentDetails.paymentId;
      
      // For recurring subscriptions, add the subscription ID
      if (!isOneTime && paymentDetails.subscriptionId) {
        subscription.razorpaySubscriptionId = paymentDetails.subscriptionId;
      }
      
      // Add order ID if available
      if (paymentDetails.razorpay_order_id || paymentDetails.orderId) {
        subscription.razorpayOrderId = paymentDetails.razorpay_order_id || paymentDetails.orderId;
      }
    }
    
    // Save to MongoDB
    try {
      console.log("Saving subscription to database:", subscription);
      await axios.post('http://localhost:3001/api/subscriptions', subscription);
      console.log(`Razorpay subscription ${subscriptionId} assigned to user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error saving subscription to MongoDB:", error);
      return false;
    }
  } catch (error) {
    console.error("Error assigning Razorpay subscription:", error);
    return false;
  }
};
