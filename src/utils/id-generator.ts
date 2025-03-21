
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
 * Generates a unique order ID for Razorpay that follows their required format
 * Format: order_<14-character alphanumeric ID>
 * 
 * IMPORTANT: In production, order IDs should be created on your backend server
 * using the Razorpay Orders API
 * 
 * @returns A properly formatted order ID
 */
export const generateOrderId = (): string => {
  // Generate a 14-character alphanumeric string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 14; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Return the formatted order ID
  return `order_${result}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * 
 * IMPORTANT: In production, subscription IDs should be created on your backend server
 * using the Razorpay Subscriptions API
 * 
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Simple format that matches Razorpay's subscription ID format
  return `sub_${nanoid(14)}`;
};

export { nanoid };
