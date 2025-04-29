
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
    const subscriptionId = paymentDetails?.subscriptionId || paymentDetails?.razorpay_subscription_id || `sub${Date.now()}`;
    
    const isOneTime = packageDetails.paymentType === "one-time";
    
    // Get advance payment months from either payment details or package
    const advancePaymentMonths = paymentDetails?.advanceMonths || packageDetails.advancePaymentMonths || 0;
    
    // Calculate end date based on package duration + advance months
    const endDate = new Date();
    const totalMonths = (packageDetails.durationMonths || 12) + advancePaymentMonths;
    endDate.setMonth(endDate.getMonth() + totalMonths);
    
    // Calculate recurring payment start date (after advance months)
    const recurringStartDate = new Date();
    if (advancePaymentMonths > 0) {
      recurringStartDate.setMonth(recurringStartDate.getMonth() + advancePaymentMonths);
    }
    
    // Calculate total amount including setup fee and advance payments
    const setupFee = packageDetails.setupFee || 0;
    const recurringAmount = isOneTime ? 0 : packageDetails.price || 0;
    const advanceAmount = isOneTime ? 0 : (recurringAmount * advancePaymentMonths);
    const totalAmount = isOneTime ? 
      packageDetails.price + setupFee : // Include setup fee for one-time payments
      (setupFee + advanceAmount);
    
    // Handle the case where nextBillingDate is provided directly in paymentDetails
    let nextBillingDate = recurringStartDate.toISOString();
    if (paymentDetails?.nextBillingDate) {
      nextBillingDate = paymentDetails.nextBillingDate;
    }
    
    console.log("Creating subscription with nextBillingDate:", nextBillingDate);
    console.log("Total amount calculated:", totalAmount, "(setup fee:", setupFee, ", base price:", packageDetails.price, ")");
    
    // Prepare subscription data
    const subscription: SubscriptionData = {
      id: subscriptionId,
      userId: userId,
      packageId: packageDetails.id,
      packageName: packageDetails.title,
      amount: totalAmount,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedBy: "user",
      assignedAt: new Date().toISOString(),
      advancePaymentMonths: advancePaymentMonths,
      signupFee: setupFee,
      actualStartDate: new Date().toISOString(),
      isPaused: false,
      isPausable: !isOneTime,
      isUserCancellable: !isOneTime,
      invoiceIds: [],
      paymentType: packageDetails.paymentType || "recurring",
      billingCycle: packageDetails.billingCycle,
      recurringAmount: recurringAmount,
      nextBillingDate: isOneTime ? undefined : nextBillingDate
    };
    
    // Add payment details if provided
    if (paymentDetails) {
      subscription.paymentMethod = "razorpay";
      subscription.transactionId = paymentDetails.razorpay_payment_id || paymentDetails.paymentId;
      
      // For recurring subscriptions, add the subscription ID
      if (!isOneTime && (paymentDetails.subscriptionId || paymentDetails.razorpay_subscription_id)) {
        subscription.razorpaySubscriptionId = paymentDetails.razorpay_subscription_id || paymentDetails.subscriptionId;
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
