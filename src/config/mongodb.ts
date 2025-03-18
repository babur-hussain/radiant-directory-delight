
// Create a more comprehensive mock version that supports required interfaces
const createMockDocument = (data: any = {}) => {
  return {
    ...data,
    toObject: () => ({ ...data }),
    save: () => Promise.resolve(data),
    lean: () => Promise.resolve(data)
  };
};

// Create a mock collection with chainable methods
const createMockCollection = () => {
  const mockFind = (query?: any) => ({
    lean: () => Promise.resolve([createMockDocument(query || {})]),
    sort: () => ({
      lean: () => Promise.resolve([createMockDocument(query || {})])
    })
  });

  return {
    find: (query?: any) => mockFind(query),
    findOne: (query?: any) => ({
      lean: () => Promise.resolve(createMockDocument(query || {}))
    }),
    findOneAndUpdate: (query?: any, update?: any, options?: any) => Promise.resolve(createMockDocument(query || {})),
    deleteOne: (query?: any) => Promise.resolve({ deletedCount: 1 }),
    findOneAndDelete: (query?: any) => Promise.resolve(createMockDocument(query || {})),
    updateOne: (query?: any, update?: any) => Promise.resolve({ modifiedCount: 1 }),
    countDocuments: (query?: any) => Promise.resolve(0)
  };
};

// Stores mock models to ensure we return consistent instances
const mockModels: Record<string, any> = {};

// Mock mongoose instance
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
  model: function(name: string, schema?: any) {
    // Return existing model if already created
    if (mockModels[name]) {
      return mockModels[name];
    }

    // For direct model retrievals without a schema
    if (!schema) {
      // Create a mock model on-the-fly if not found
      const mockModel = createModelMock(name);
      mockModels[name] = mockModel;
      return mockModel;
    }

    // Create a new model with the schema
    const mockModel = createModelMock(name);
    mockModels[name] = mockModel;
    return mockModel;
  },
  Types: {
    ObjectId: String
  }
};

// Define an interface for our document methods
interface MockDocumentMethods {
  save: () => Promise<any>;
  toObject: () => any;
  [key: string]: any;
}

// Helper to create a model mock
function createModelMock(name: string) {
  // Create mock collection methods
  const collection = createMockCollection();
  
  // Add create method that returns proper document
  const createMethod = (data: any) => {
    if (Array.isArray(data)) {
      return Promise.resolve(data.map(item => createMockDocument(item)));
    }
    return Promise.resolve(createMockDocument(data));
  };

  // Create a constructor function that returns a document
  function Constructor(this: MockDocumentMethods, data: any) {
    if (!(this instanceof Constructor)) {
      return new (Constructor as any)(data);
    }
    
    // Copy all data properties to this instance
    Object.assign(this, data);
    
    // Add document methods explicitly
    this.save = function() {
      return Promise.resolve(this);
    };
    
    this.toObject = function() {
      return { ...data };
    };
    
    return this;
  }
  
  // Add static methods to constructor
  Object.assign(Constructor, {
    ...collection,
    create: createMethod,
    new: (data: any) => new (Constructor as any)(data)
  });
  
  return Constructor;
}

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
