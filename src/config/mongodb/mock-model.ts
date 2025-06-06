
/**
 * This file contains the mock Mongoose model implementation
 * for testing without a real database connection
 */

import { QueryResult } from './query-result';

/**
 * Create a mock Mongoose model with all commonly used methods
 */
export function createMockModel(name: string, schema: any) {
  return {
    schema,
    collection: { collectionName: name.toLowerCase() },
    // Add methods commonly used in MongoDB queries
    find: (query = {}) => {
      return new QueryResult([]);
    },
    findOne: (query = {}) => Promise.resolve(null),
    findOneAndUpdate: (query: any, update: any, options: any = {}) => {
      // Support for new and upsert options
      const newOptions = {
        new: options.new || false,
        upsert: options.upsert || false,
        ...options
      };
      return Promise.resolve(null);
    },
    findOneAndDelete: (query: any) => Promise.resolve(null),
    deleteMany: (query: any) => Promise.resolve({ deletedCount: 0 }),
    deleteOne: (query: any) => Promise.resolve({ deletedCount: 0 }),
    create: (data: any) => Promise.resolve(data),
    insertMany: (data: any) => Promise.resolve(data),
    updateOne: (query: any, update: any, options: any = {}) => {
      const newOptions = {
        upsert: options.upsert || false,
        ...options
      };
      return Promise.resolve({ modifiedCount: 1, upsertedCount: 0 });
    },
    updateMany: (query: any, update: any, options: any = {}) => {
      const newOptions = {
        upsert: options.upsert || false,
        ...options
      };
      return Promise.resolve({ modifiedCount: 1, upsertedCount: 0 });
    },
    countDocuments: (query = {}) => Promise.resolve(0),
    // Add any other methods needed
  };
}
