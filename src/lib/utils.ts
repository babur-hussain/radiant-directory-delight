
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a Google search URL for a business
 * @param businessName The name of the business
 * @param businessAddress The address of the business
 * @returns A formatted Google search URL
 */
export function createGoogleSearchUrl(businessName: string, businessAddress: string): string {
  // Format the search query to include business name and address
  const searchQuery = `${businessName} ${businessAddress}`;
  // Encode the search query for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  // Create the Google search URL
  return `https://www.google.com/search?q=${encodedQuery}`;
}

// Add the generateId function
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Formats a date string to a more readable format
 * @param dateString - The date string to format
 * @returns A formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format: "Jan 1, 2023"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formats a currency value
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns A formatted currency string
 */
export const formatCurrency = (amount?: number | null, currency: string = 'USD'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
};
