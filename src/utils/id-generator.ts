
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
  // For test mode, we need to format this as order_XXX where XXX is random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `order_${timestamp}${random}`;
};

export { nanoid };
