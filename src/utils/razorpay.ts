
/**
 * Format a date for display in subscription context
 */
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Convert currency amount to paise (smallest currency unit in INR)
 * Razorpay requires amounts in paise
 */
export const convertToPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert paise amount back to rupees
 */
export const convertFromPaise = (amountInPaise: number): number => {
  return amountInPaise / 100;
};
