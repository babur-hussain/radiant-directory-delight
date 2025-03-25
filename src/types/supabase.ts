
// Type definitions for Supabase schema and database types

// Define a type for Supabase JSON fields
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Helper type for handling Supabase response values
export type DatabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Helper type for business hours
export type BusinessHours = Record<string, string>;

// Helper function to safely parse JSON
export const safeParse = <T>(jsonString: string | null | undefined, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
};
