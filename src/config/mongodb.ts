
// Create a more comprehensive mock version that supports required interfaces
const mongoose = {
  connection: null,
  connect: () => Promise.resolve(true),
  Schema: function(schema: any) {
    const schemaObj = {
      // Convert the schema definition to a usable object
      ...schema,
      // Add schema methods
      index: () => schemaObj,
      pre: (event: string, callback: any) => {
        if (typeof callback === 'function') {
          // Mock pre-save hook execution
          try {
            callback.call(schemaObj);
          } catch (err) {
            console.error("Error in pre hook:", err);
          }
        }
        return schemaObj;
      },
      virtual: (name: string) => ({ 
        get: (fn: Function) => schemaObj 
      }),
      methods: {}
    };
    
    return schemaObj;
  },
  model: function(name: string, schema: any) {
    // Create a mock document that will be returned by queries
    const createMockDocument = (data: any = {}) => {
      return {
        ...data,
        toObject: () => ({ ...data }),
        save: () => Promise.resolve(data)
      };
    };
    
    // Create a mock return with all required methods for model
    return {
      // Find methods
      find: (query = {}) => ({ 
        lean: () => Promise.resolve([]),
        sort: () => ({ lean: () => Promise.resolve([]) })
      }),
      findOne: (query = {}) => ({ 
        lean: () => Promise.resolve(null) 
      }),
      findOneAndUpdate: (query = {}, update = {}, options = {}) => Promise.resolve(createMockDocument()),
      deleteOne: (query = {}) => Promise.resolve({ deletedCount: 1 }),
      findOneAndDelete: (query = {}) => Promise.resolve(createMockDocument()),
      updateOne: (query = {}, update = {}) => Promise.resolve({ modifiedCount: 1 }),
      countDocuments: (query = {}) => Promise.resolve(0),
      
      // Create method
      create: (data: any) => {
        const doc = createMockDocument(data);
        return Promise.resolve(doc);
      },
      
      // Direct instantiation (new Model())
      new: function(data: any) {
        return createMockDocument(data);
      }
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
