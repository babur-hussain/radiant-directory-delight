
/**
 * Utility functions for Razorpay integration
 */

// Helper function to determine if a package is eligible for recurring payments
export const isRecurringPaymentEligible = (
  paymentType: string,
  billingCycle?: string
): boolean => {
  // Only recurring packages with valid billing cycles can use recurring payments
  return paymentType === 'recurring' && !!billingCycle;
};

// Helper function to calculate the next billing date after advance payments
export const calculateNextBillingDate = (
  billingCycle?: string, 
  advanceMonths: number = 0
): Date => {
  const today = new Date();
  
  if (billingCycle === 'monthly') {
    // For monthly billing, add advance months
    today.setMonth(today.getMonth() + advanceMonths);
  } else {
    // For yearly billing, add advance years (convert months to years)
    today.setFullYear(today.getFullYear() + Math.floor(advanceMonths / 12));
    // Add the remaining months if any
    today.setMonth(today.getMonth() + (advanceMonths % 12));
  }
  
  return today;
};

// Format date for display in the UI
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate the total initial payment amount for a subscription
export const calculateInitialPayment = (
  isOneTime: boolean,
  setupFee: number = 0,
  recurringAmount: number = 0,
  advanceMonths: number = 0,
  billingCycle?: string,
  monthlyPrice?: number
): number => {
  if (isOneTime) {
    return recurringAmount;
  }
  
  // For recurring, calculate setup fee + advance payments
  let advancePayment = 0;
  
  if (billingCycle === 'monthly' && monthlyPrice) {
    advancePayment = monthlyPrice * advanceMonths;
  } else if (billingCycle === 'yearly') {
    // For yearly, we charge one full year in advance
    advancePayment = recurringAmount;
  }
  
  return setupFee + advancePayment;
};
