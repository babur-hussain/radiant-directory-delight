
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format currency value
export const formatCurrency = (amount: number | null | undefined, currency: string = "INR"): string => {
  if (amount === null || amount === undefined) return "N/A";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate a unique ID
export const generateId = (prefix: string = ""): string => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a Google search URL for a business
export const createGoogleSearchUrl = (
  businessName: string, 
  address?: string
): string => {
  const searchQuery = address 
    ? `${businessName} ${address}` 
    : businessName;
  
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
};
