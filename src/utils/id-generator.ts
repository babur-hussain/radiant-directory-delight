
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
  // Use simpler format to avoid validation issues
  // In production, get real order IDs from Razorpay Orders API
  return `order_${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 100)}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * 
 * IMPORTANT: In production, subscription IDs should be created on your backend server
 * using the Razorpay Subscriptions API:
 * POST https://api.razorpay.com/v1/subscriptions
 * 
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Simple format that matches Razorpay's subscription ID format
  // In production, get real subscription IDs from Razorpay Subscriptions API
  return `sub_${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 100)}`;
};

export { nanoid };
