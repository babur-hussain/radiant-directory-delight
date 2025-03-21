
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
 * @returns A properly formatted order ID for Razorpay
 */
export const generateOrderId = (): string => {
  // Generate exactly 14 alphanumeric characters as per Razorpay requirements
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Create a 14-character string using cryptographically secure random values
  const randomValues = new Uint8Array(14);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 14; i++) {
    result += allowedChars.charAt(randomValues[i] % allowedChars.length);
  }
  
  // Return the formatted order ID with the required prefix
  return `order_${result}`;
};

/**
 * Generates a unique subscription ID for Razorpay
 * Format: sub_<14-character alphanumeric ID>
 * 
 * @returns A properly formatted subscription ID
 */
export const generateSubscriptionId = (): string => {
  // Generate exactly 14 alphanumeric characters as per Razorpay requirements
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Create a 14-character string using cryptographically secure random values
  const randomValues = new Uint8Array(14);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 14; i++) {
    result += allowedChars.charAt(randomValues[i] % allowedChars.length);
  }
  
  // Return the formatted subscription ID with the required prefix
  return `sub_${result}`;
};

export { nanoid };
