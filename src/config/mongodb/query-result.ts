
/**
 * This file contains the QueryResult class for handling MongoDB query results
 */

// Improved QueryResult class that extends Array for better compatibility
export class QueryResult<T = any> extends Array<T> {
  results: T[] = [];
  
  constructor(results: T[] = []) {
    super();
    if (results && Array.isArray(results)) {
      results.forEach(item => this.push(item));
      this.results = [...results];
    }
  }
  
  sort(sortOptions: any) {
    // This is a mock implementation - just return this
    return this;
  }
  
  exec() {
    return Promise.resolve(this);
  }
  
  lean() {
    return this;
  }
}

/**
 * Helper function to extract query results safely and handle type casting
 */
export function extractQueryResults<T>(queryResult: any): T[] {
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
  
  return [];
}
