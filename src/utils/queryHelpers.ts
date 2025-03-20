
import { QueryResult } from '../config/mongodb';

/**
 * Helper function to safely extract data from MongoDB queries
 * and ensure they are properly typed
 */
export function extractQueryData<T>(queryResult: any): T[] {
  if (!queryResult) return [];
  
  if (Array.isArray(queryResult)) {
    return queryResult as T[];
  }
  
  if (queryResult instanceof QueryResult) {
    return Array.from(queryResult) as T[];
  }
  
  if (queryResult.results && Array.isArray(queryResult.results)) {
    return queryResult.results as T[];
  }
  
  if (typeof queryResult.toArray === 'function') {
    return queryResult.toArray() as T[];
  }
  
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
  
  console.warn('Unknown query result format, returning empty array');
  return [];
}
