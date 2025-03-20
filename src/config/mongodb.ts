
import mongoose from 'mongoose';

const MOCK_DB_NAME = 'growbharatdb';
let mockConnection = false;

// MongoDB mock implementation
const mongooseMock = {
  Schema: (definition: any, options?: any) => definition,
  model: (name: string, schema: any) => {
    return {
      schema,
      collection: { collectionName: name.toLowerCase() },
      // Add methods commonly used in MongoDB queries
      find: (query = {}) => {
        // Return a chainable object with exec and sort methods
        const queryResult = {
          results: [],
          sort: function(sortOptions: any) {
            // Just return self for chaining
            return this;
          },
          exec: function() {
            // Return a promise that resolves to the results
            return Promise.resolve(this.results);
          },
          lean: function() {
            // Return self for chaining
            return this;
          }
        };
        return Promise.resolve(queryResult);
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
export { isProduction };

export const mongoose = isProduction ? mongoose : mongooseMock;

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
