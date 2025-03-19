
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
  connection: {
    readyState: 0, // Disconnected by default
    host: 'localhost',
    name: 'test' // Set database name to 'test' as requested
  },
  connect: () => {
    mongoose.connection.readyState = 1; // Set to connected
    return Promise.resolve(true);
  },
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
      // Store the data in localStorage for persistence
      const collectionKey = `mongodb_${name}`;
      try {
        const collection = JSON.parse(localStorage.getItem(collectionKey) || '[]');
        // Check if item exists by id or uid
        const idField = data.id || data.uid;
        const index = collection.findIndex((item: any) => 
          (item.id && item.id === idField) || (item.uid && item.uid === idField)
        );
        
        if (index >= 0) {
          // Update existing item
          collection[index] = { ...collection[index], ...data };
        } else {
          // Add new item
          collection.push(data);
        }
        
        localStorage.setItem(collectionKey, JSON.stringify(collection));
        console.log(`Saved document to ${name} collection:`, data);
      } catch (error) {
        console.error(`Error saving to ${name} collection:`, error);
      }
      
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

// Set connection string for MongoDB Atlas cluster
const MONGODB_URI = 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

let isConnected = false;

// Connect to MongoDB with better error handling
export const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return true;
  }

  try {
    // In browser environment, simulate connection and use localStorage
    console.log('Connecting to MongoDB (simulated in browser)');
    isConnected = true;
    mongoose.connection.readyState = 1;

    // Initialize default admin user if not exists
    const userCollection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    const adminExists = userCollection.some((user: any) => 
      user.email === 'baburhussain660@gmail.com' && user.isAdmin
    );

    if (!adminExists) {
      const adminUser = {
        uid: 'admin_' + Date.now(),
        email: 'baburhussain660@gmail.com',
        name: 'Admin User',
        role: 'Admin',
        isAdmin: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      userCollection.push(adminUser);
      localStorage.setItem('mongodb_User', JSON.stringify(userCollection));
      console.log('Default admin user created:', adminUser);
    }

    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

// Check if MongoDB is connected
export const isMongoDBConnected = () => {
  return isConnected || mongoose.connection.readyState === 1;
};

// Export mongoose for compatibility
export { mongoose };
