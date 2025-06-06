
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
