
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
 * Generates a unique employee code
 * @param prefix Optional prefix for the employee code (default: 'EMP')
 * @returns A properly formatted employee code
 */
export const generateEmployeeCode = (prefix: string = 'EMP'): string => {
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const datePart = new Date().getFullYear().toString().substring(2);
  return `${prefix}${datePart}${randomPart}`;
};

/**
 * Generates a unique order ID for Razorpay that follows their best practices
 * 
 * IMPORTANT: In production, order IDs should be created on your backend server
 * using the Razorpay Orders API:
 * POST https://api.razorpay.com/v1/orders
 * 
 * @returns A properly formatted order ID
 */
export const generateOrderId = (): string => {
  // Use simple format to avoid validation issues
  // In production, get real order IDs from Razorpay Orders API
  return `order_${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
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
  return `sub_${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
};

export { nanoid };
