
import { QueryResult } from '@/config/mongodb';

/**
 * Helper function to safely extract data from mongoose-like query results
 * Handles various result formats including arrays, objects with results property,
 * QueryResult instances, and objects with exec/sort methods
 */
export const extractQueryData = <T>(queryResult: any): T[] => {
  if (!queryResult) return [];
  
  // If it's already an array
  if (Array.isArray(queryResult)) {
    return queryResult as T[];
  }
  
  // If it's our custom QueryResult class
  if (queryResult instanceof QueryResult) {
    return Array.from(queryResult) as T[];
  }
  
  // If it has a results property containing an array
  if (queryResult.results && Array.isArray(queryResult.results)) {
    return queryResult.results as T[];
  }
  
  // If it has an exec method, try to get results from it
  if (queryResult.exec && typeof queryResult.exec === 'function') {
    try {
      const result = queryResult.exec();
      if (result instanceof Promise) {
        console.warn('Warning: exec() returned a Promise but we need synchronous results');
        return [];
      }
      return Array.isArray(result) ? result : [result].filter(Boolean) as T[];
    } catch (error) {
      console.error('Error executing query:', error);
      return [];
    }
  }
  
  // If it's an object that cannot be categorized, return it as a single-element array if not null
  if (queryResult && typeof queryResult === 'object' && !Array.isArray(queryResult)) {
    return [queryResult] as T[];
  }
  
  // Default case - return empty array
  return [];
};

/**
 * Safely accesses a property path on an object, returning undefined if any part is missing
 */
export const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] ? prev[curr] : undefined;
  }, obj);
};
