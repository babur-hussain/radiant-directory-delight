
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
  // Razorpay requires order_id to be unique but doesn't strictly require a specific format
  // Using a simple format with a timestamp and random string for uniqueness
  return `order_${Date.now()}_${nanoid(8)}`;
};

export { nanoid };
