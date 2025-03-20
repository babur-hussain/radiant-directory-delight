
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
  // Simple timestamp-based order ID
  return `order_${Date.now()}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Simple timestamp-based subscription ID with random suffix
  return `sub_${Date.now()}_${nanoid(6)}`;
};

export { nanoid };
