
import { nanoid } from 'nanoid';

// Mock mongoose for client-side
export const mongoose = {
  Schema: function(definition: any, options?: any) {
    return {
      ...definition,
      options,
      pre: function(hook: string, callback: Function) {
        this.preHooks = this.preHooks || {};
        this.preHooks[hook] = callback;
        return this;
      },
      index: function(fields: any, options?: any) {
        this.indexes = this.indexes || [];
        this.indexes.push({ fields, options });
        return this;
      },
    };
  },
  model: function(name: string, schema: any) {
    const collectionName = `mongodb_${name}`;
    
    // Initialize local storage if not already done
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(collectionName)) {
      localStorage.setItem(collectionName, '[]');
    }

    // Helper to create a query result object with chaining methods
    const createQueryResultObject = (results: any[]) => {
      return {
        results,
        sort: function(sortOptions: any) {
          if (!sortOptions) return this;
          
          const [field, order] = Object.entries(sortOptions)[0];
          this.results.sort((a: any, b: any) => {
            if (a[field] < b[field]) return order === 1 ? -1 : 1;
            if (a[field] > b[field]) return order === 1 ? 1 : -1;
            return 0;
          });
          return this;
        },
        exec: async function() {
          return this.results;
        },
        lean: function() {
          return this;
        }
      };
    };
    
    const modelObj = {
      schema,
      collection: { collectionName },
      async find(query = {}) {
        console.log(`[MongoDB Mock] Finding documents in ${name} with query:`, query);
        try {
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          let results = [...collection];
          
          // Apply filters based on query
          if (Object.keys(query).length > 0) {
            results = results.filter((doc: any) => {
              for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) return false;
              }
              return true;
            });
          }
          
          return createQueryResultObject(results);
        } catch (err) {
          console.error(`[MongoDB Mock] Error in find operation for ${name}:`, err);
          return createQueryResultObject([]);
        }
      },
      async findOne(query = {}) {
        console.log(`[MongoDB Mock] Finding one document in ${name} with query:`, query);
        try {
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          
          // Apply filters based on query
          const result = collection.find((doc: any) => {
            for (const [key, value] of Object.entries(query)) {
              if (doc[key] !== value) return false;
            }
            return true;
          });
          
          return result || null;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in findOne operation for ${name}:`, err);
          return null;
        }
      },
      async findOneAndUpdate(query: any, update: any, options: any = {}) {
        console.log(`[MongoDB Mock] Updating document in ${name} with query:`, query);
        console.log(`[MongoDB Mock] Update data:`, update);
        
        try {
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          let index = -1;
          
          // Find the document index
          if (query.id) {
            index = collection.findIndex((doc: any) => doc.id === query.id);
          } else {
            index = collection.findIndex((doc: any) => {
              for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) return false;
              }
              return true;
            });
          }
          
          let result;
          
          // Create or update based on options
          if (index === -1 && options.upsert) {
            // Create new document with query values
            const newDoc = { ...query };
            
            // Apply update
            if (update.$set) {
              Object.assign(newDoc, update.$set);
            }
            
            // Ensure it has an ID if not already present
            if (!newDoc.id) {
              newDoc.id = nanoid();
            }
            
            // Add created and updated timestamps
            if (!newDoc.createdAt) {
              newDoc.createdAt = new Date();
            }
            newDoc.updatedAt = new Date();
            
            // Add to collection
            collection.push(newDoc);
            result = newDoc;
            console.log(`[MongoDB Mock] Created new document in ${name}:`, newDoc);
          } else if (index !== -1) {
            // Update existing document
            if (update.$set) {
              // For $set operation
              collection[index] = {
                ...collection[index],
                ...update.$set,
                updatedAt: new Date()
              };
            } else {
              // Direct update (without $set)
              collection[index] = {
                ...collection[index],
                ...update,
                updatedAt: new Date()
              };
            }
            
            result = collection[index];
            console.log(`[MongoDB Mock] Updated document in ${name}:`, result);
          } else {
            console.log(`[MongoDB Mock] Document not found and upsert not enabled`);
            return null;
          }
          
          // Save to localStorage
          localStorage.setItem(collectionName, JSON.stringify(collection));
          
          // Return based on options
          return options.new !== false ? result : null;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in findOneAndUpdate operation for ${name}:`, err);
          return null;
        }
      },
      async findOneAndDelete(query: any) {
        console.log(`[MongoDB Mock] Deleting document in ${name} with query:`, query);
        
        try {
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          let index = -1;
          
          // Find the document index
          if (query.id) {
            index = collection.findIndex((doc: any) => doc.id === query.id);
          } else {
            index = collection.findIndex((doc: any) => {
              for (const [key, value] of Object.entries(query)) {
                if (doc[key] !== value) return false;
              }
              return true;
            });
          }
          
          if (index === -1) {
            console.log(`[MongoDB Mock] Document not found for deletion`);
            return null;
          }
          
          // Get the document before removing it
          const deletedDoc = collection[index];
          
          // Remove the document
          collection.splice(index, 1);
          
          // Save to localStorage
          localStorage.setItem(collectionName, JSON.stringify(collection));
          
          console.log(`[MongoDB Mock] Deleted document in ${name}:`, deletedDoc);
          return deletedDoc;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in findOneAndDelete operation for ${name}:`, err);
          return null;
        }
      },
      async create(doc: any) {
        try {
          // Ensure the document has an ID
          if (!doc.id) {
            doc.id = nanoid();
          }
          
          // Add timestamp if not present
          if (!doc.createdAt) {
            doc.createdAt = new Date();
          }
          doc.updatedAt = new Date();
          
          // Get the collection
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          
          // Add new document
          collection.push(doc);
          
          // Save to localStorage
          localStorage.setItem(collectionName, JSON.stringify(collection));
          
          console.log(`[MongoDB Mock] Created document in ${name}:`, doc);
          return doc;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in create operation for ${name}:`, err);
          throw err;
        }
      },
      async countDocuments(query = {}) {
        try {
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          
          if (Object.keys(query).length === 0) {
            return collection.length;
          }
          
          // Filter by query
          const count = collection.filter((doc: any) => {
            for (const [key, value] of Object.entries(query)) {
              if (doc[key] !== value) return false;
            }
            return true;
          }).length;
          
          return count;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in countDocuments operation for ${name}:`, err);
          return 0;
        }
      },
      async save(doc: any) {
        try {
          // Get the collection
          const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
          
          // Ensure the document has an ID
          if (!doc.id) {
            doc.id = nanoid();
          }
          
          // Add timestamp if not present
          if (!doc.createdAt) {
            doc.createdAt = new Date();
          }
          doc.updatedAt = new Date();
          
          // Check if pre-save hooks exist and run them
          if (schema.preHooks && schema.preHooks.save) {
            schema.preHooks.save.call(doc);
          }
          
          // Find if the document exists
          const index = collection.findIndex((item: any) => item.id === doc.id);
          
          if (index >= 0) {
            // Update existing document
            collection[index] = { ...collection[index], ...doc };
          } else {
            // Add new document
            collection.push(doc);
          }
          
          // Save to localStorage
          localStorage.setItem(collectionName, JSON.stringify(collection));
          
          console.log(`[MongoDB Mock] Saved document in ${name}:`, doc);
          return doc;
        } catch (err) {
          console.error(`[MongoDB Mock] Error in save operation for ${name}:`, err);
          throw err;
        }
      }
    };
    
    return modelObj;
  },
  connect: async function(uri: string) {
    console.log(`[MongoDB Mock] Connecting to ${uri}`);
    return { connection: { readyState: 1 } };
  },
  connection: {
    readyState: 1,
    host: 'localhost',
    name: 'mock_db'
  }
};

// Simulate MongoDB connection
let isConnected = false;

// Connect to MongoDB (mock)
export const connectToMongoDB = async (): Promise<boolean> => {
  try {
    if (isConnected) {
      console.log('MongoDB is already connected.');
      return true;
    }
    
    console.log('Connecting to MongoDB...');
    
    // Simulate connection delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    isConnected = true;
    console.log('Connected to MongoDB successfully.');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Check MongoDB connection status
export const isMongoDB_Connected = (): boolean => {
  return isConnected;
};

// Add alias for isMongoDB_Connected to fix naming mismatches
export const isMongoDBConnected = isMongoDB_Connected;

// Disconnect from MongoDB (mock)
export const disconnectFromMongoDB = async (): Promise<void> => {
  isConnected = false;
  console.log('Disconnected from MongoDB.');
};
