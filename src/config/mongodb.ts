
import * as mongooseModule from 'mongoose';

const MOCK_DB_NAME = 'growbharatdb';
let mockConnection = false;

// Enhanced Schema mock class with method support
class SchemaMock {
  definition: any;
  indexes: any[] = [];
  virtuals: Record<string, any> = {};
  hooks: Record<string, any[]> = {};
  methodsObj: Record<string, Function> = {};

  constructor(definition: any, options?: any) {
    this.definition = definition;
  }

  index(fields: any, options?: any) {
    this.indexes.push({ fields, options });
    return this;
  }

  virtual(name: string) {
    const virtualObj = {
      get: (fn: Function) => {
        this.virtuals[name] = { getter: fn };
        return virtualObj;
      },
      set: (fn: Function) => {
        if (!this.virtuals[name]) this.virtuals[name] = {};
        this.virtuals[name].setter = fn;
        return virtualObj;
      }
    };
    return virtualObj;
  }

  pre(action: string, callback: Function) {
    if (!this.hooks[action]) this.hooks[action] = [];
    this.hooks[action].push(callback);
    return this;
  }

  post(action: string, callback: Function) {
    if (!this.hooks[`post:${action}`]) this.hooks[`post:${action}`] = [];
    this.hooks[`post:${action}`].push(callback);
    return this;
  }

  get methods() {
    return this.methodsObj;
  }
  
  set methods(methodsObj: Record<string, Function>) {
    this.methodsObj = methodsObj;
  }
}

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

// Helper function to extract query results safely and handle type casting
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

// Make SchemaClass both a function and a class
const SchemaClass = function(definition: any, options?: any) {
  return new SchemaMock(definition, options);
} as any;

// Assign the constructor
SchemaClass.prototype = SchemaMock.prototype;
SchemaClass.constructor = SchemaMock;

// MongoDB mock implementation
const mongooseMock = {
  Schema: SchemaClass,
  model: (name: string, schema: any) => {
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
  },
  // Mock mongoose.connect
  connect: (uri: string, options?: any) => {
    console.log('MongoDB Mock: Connecting to', MOCK_DB_NAME);
    mockConnection = true;
    return Promise.resolve({ connection: { db: { databaseName: MOCK_DB_NAME } } });
  },
  // Mock connection property
  connection: {
    readyState: 1, // Connected
    host: 'localhost',
    name: MOCK_DB_NAME,
    db: { databaseName: MOCK_DB_NAME }
  }
};

// Use the real mongoose in production, mock in development/test
const isProduction = false; // Always use mock for now

// Export the mongoose instance (real or mock)
export const mongoose = isProduction ? mongooseModule : mongooseMock;

let isConnected = false;

export const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('=> MongoDB already connected');
    return true;
  }
  
  try {
    if (isProduction) {
      // Real MongoDB connection logic would go here
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/growbharatdb';
      await mongoose.connect(uri);
      isConnected = true;
      console.log('=> Connected to MongoDB');
      return true;
    } else {
      // Mock connection
      console.log('=> Using MongoDB mock implementation');
      mockConnection = true;
      isConnected = true;
      return true;
    }
  } catch (error) {
    console.error('=> MongoDB connection error:', error);
    isConnected = false;
    return false;
  }
};

export const isMongoDB_Connected = () => {
  return isConnected;
};

// Alias for compatibility with existing code
export const isMongoDBConnected = isMongoDB_Connected;

// Export the mongoose instance for use elsewhere
export default mongoose;
