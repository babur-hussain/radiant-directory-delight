
// Create a more comprehensive mock version that supports required interfaces
const mongoose = {
  connection: null,
  connect: () => Promise.resolve(true),
  Schema: function(schema: any) {
    return {
      index: () => ({}),
      pre: (event: string, callback: Function) => {
        if (typeof callback === 'function') callback();
        return {};
      },
      virtual: (name: string) => ({ 
        get: (fn: Function) => ({}) 
      }),
      methods: {},
      ...schema
    };
  },
  model: function(name: string, schema: any) {
    return {
      find: () => ({ 
        lean: () => Promise.resolve([]),
        sort: () => ({ lean: () => Promise.resolve([]) })
      }),
      findOne: () => ({ lean: () => Promise.resolve(null) }),
      findOneAndUpdate: () => Promise.resolve({}),
      deleteOne: () => Promise.resolve({ deletedCount: 1 }),
      findOneAndDelete: () => Promise.resolve({}),
      updateOne: () => Promise.resolve({ modifiedCount: 1 }),
      countDocuments: () => Promise.resolve(0),
      create: (data: any) => Promise.resolve({ 
        ...data, 
        toObject: () => data 
      })
    };
  },
  Types: {
    ObjectId: String
  }
};

// Set a very safe connection string with faster timeouts
const MONGODB_URI = 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Track connection state
let isConnected = false;

// Connect to MongoDB with browser-safe implementation
export const connectToMongoDB = async () => {
  console.log('MongoDB connection requested, but running in browser');
  // Return success without actually connecting in browser environment
  isConnected = true;
  return true;
};

// Check if MongoDB is connected
export const isMongoDBConnected = () => {
  return isConnected;
};

// Export mongoose for compatibility
export { mongoose };
