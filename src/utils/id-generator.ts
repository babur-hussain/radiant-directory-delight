
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
 * Generates a Razorpay order ID
 * @returns A properly formatted order ID for Razorpay
 */
export const generateRazorpayOrderId = (): string => {
  // Always starts with "order_" followed by exactly 14 alphanumeric characters
  // This matches Razorpay's format requirement
  return `order_${nanoid(14)}`;
};

export { nanoid };
