
import { nanoid } from 'nanoid';

/**
 * Generates a unique ID using nanoid
 * @param length Optional length of the ID (default: 21)
 * @returns A unique string ID
 */
export const generateId = (length: number = 21): string => {
  return nanoid(length);
};

/**
 * Generates a short ID for display purposes
 * @returns A short ID (8 characters)
 */
export const generateShortId = (): string => {
  return nanoid(8);
};

/**
 * Generates a unique order ID for Razorpay that follows their validation requirements
 * 
 * IMPORTANT: In production, order IDs should be created on your backend server
 * using the Razorpay Orders API:
 * POST https://api.razorpay.com/v1/orders
 * 
 * @returns A properly formatted order ID
 */
export const generateOrderId = (): string => {
  // Format that's more likely to be accepted by Razorpay's validation
  return `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Generates a unique subscription ID for Razorpay that follows their validation format
 * 
 * IMPORTANT: In production, subscription IDs should be created on your backend server
 * using the Razorpay Subscriptions API:
 * POST https://api.razorpay.com/v1/subscriptions
 * 
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Format that's closer to Razorpay's expected format (without the 'sub_' prefix)
  // as Razorpay will add that prefix itself
  return `${Date.now().toString().substring(0, 6)}${Math.floor(Math.random() * 10000)}`;
};

export { nanoid };
