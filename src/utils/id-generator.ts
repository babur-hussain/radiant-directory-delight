
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
 * Generates a unique order ID
 * @returns A properly formatted order ID
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `order_${timestamp}${random}`;
};

export { nanoid };
