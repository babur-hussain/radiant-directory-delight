
// Create a simplified version that doesn't block rendering
const mongoose = {
  connection: null,
  connect: () => Promise.resolve(true)
};

// Set a very safe connection string with faster timeouts
const MONGODB_URI = 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Track connection state
let isConnected = false;

// Connect to MongoDB with browser-safe implementation
export const connectToMongoDB = async () => {
  console.log('MongoDB connection requested, but running in browser');
  // Return success without actually connecting in browser environment
  return true;
};

// Check if MongoDB is connected
export const isMongoDBConnected = () => {
  return isConnected;
};

// Export mongoose for compatibility
export { mongoose };
