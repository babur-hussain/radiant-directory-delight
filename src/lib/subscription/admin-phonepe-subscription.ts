
import { SubscriptionData } from "./types";
import axios from 'axios';

export const adminAssignPhonePeSubscription = async (userId: string, packageDetails: any, paymentDetails: any): Promise<boolean> => {
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
    const subscriptionId = paymentDetails?.subscriptionId || paymentDetails?.merchantTransactionId || `sub${Date.now()}`;
    
    // Generate a unique transaction ID for tracking
    const transactionId = paymentDetails?.transaction_id || paymentDetails?.merchantTransactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
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
    
    // Add timestamp to mark when this payment was processed
    const paymentProcessedAt = new Date().toISOString();
    
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
      nextBillingDate: isOneTime ? undefined : nextBillingDate,
      transactionId: transactionId,
      paymentVerified: true,
      paymentVerifiedAt: paymentProcessedAt,
      refundEligible: false
    };
    
    // Add payment details if provided
    if (paymentDetails) {
      subscription.paymentMethod = "phonepe";
      subscription.transactionId = paymentDetails.merchantTransactionId || paymentDetails.paymentId || transactionId;
      
      // For recurring subscriptions, add the subscription ID
      if (!isOneTime && (paymentDetails.subscriptionId || paymentDetails.merchantTransactionId)) {
        subscription.phonePeTransactionId = paymentDetails.merchantTransactionId || paymentDetails.subscriptionId;
      }
      
      // Add payment completion time
      if (paymentDetails.paymentConfirmed) {
        subscription.paymentConfirmedAt = paymentDetails.paymentConfirmed;
      } else {
        subscription.paymentConfirmedAt = paymentProcessedAt;
      }
    }
    
    // Save to MongoDB
    try {
      console.log("Saving subscription to database:", subscription);
      await axios.post('http://localhost:3001/api/subscriptions', subscription);
      console.log(`PhonePe subscription ${subscriptionId} assigned to user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error saving subscription to MongoDB:", error);
      return false;
    }
  } catch (error) {
    console.error("Error assigning PhonePe subscription:", error);
    return false;
  }
};
