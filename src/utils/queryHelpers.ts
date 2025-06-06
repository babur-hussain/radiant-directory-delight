
/**
 * Query helper utilities for MongoDB
 */

import { extractQueryResults } from '../config/mongodb';

/**
 * Helper function to safely extract data from MongoDB queries
 * and ensure they are properly typed
 */
export function extractQueryData<T>(queryResult: any): T[] {
  return extractQueryResults<T>(queryResult);
}
