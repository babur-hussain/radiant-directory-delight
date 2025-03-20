
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
 * Generates a unique order ID for Razorpay that follows their best practices
 * @returns A properly formatted order ID
 */
export const generateOrderId = (): string => {
  // Use simple format to avoid validation issues
  return `order_${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 1000)}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Simple format that matches Razorpay's subscription ID format
  return `sub_${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 1000)}`;
};

export { nanoid };
