
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
 * Generates a valid order ID for Razorpay that strictly follows their required format
 * Format: order_<exactly 14 characters of alphanumeric ID>
 * 
 * @returns A properly formatted order ID for Razorpay
 */
export const generateOrderId = (): string => {
  // Define allowed characters (alphanumeric only - per Razorpay requirements)
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  // Generate exactly 14 characters as required by Razorpay
  let result = '';
  const randomValues = new Uint8Array(14);
  
  // Use cryptographically secure random number generator
  window.crypto.getRandomValues(randomValues);
  
  // Generate 14 characters string using the random values
  for (let i = 0; i < 14; i++) {
    result += allowedChars.charAt(randomValues[i] % allowedChars.length);
  }
  
  // Return the formatted ID with the required 'order_' prefix
  return `order_${result}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * Format: sub_<exactly 14 characters of alphanumeric ID>
 * 
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Define allowed characters (alphanumeric only - per Razorpay requirements)
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  // Generate exactly 14 characters as required by Razorpay
  let result = '';
  const randomValues = new Uint8Array(14);
  
  // Use cryptographically secure random number generator
  window.crypto.getRandomValues(randomValues);
  
  // Generate 14 characters string using the random values
  for (let i = 0; i < 14; i++) {
    result += allowedChars.charAt(randomValues[i] % allowedChars.length);
  }
  
  // Return the formatted ID with the required 'sub_' prefix
  return `sub_${result}`;
};

export { nanoid };
