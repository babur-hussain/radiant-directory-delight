
import mongoose from 'mongoose';

// Use a safe connection string
const MONGODB_URI = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Track connection state
let isConnecting = false;
let mongoConnected = false;
let connectAttempts = 0;

// Connect to MongoDB with better error handling
export const connectToMongoDB = async () => {
  try {
    // Prevent too many attempts
    if (connectAttempts >= 2) {
      console.log('Maximum MongoDB connection attempts reached, proceeding with local data');
      return false;
    }
    
    connectAttempts++;
    
    // Check if already connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      mongoConnected = true;
      return true;
    }
    
    // Prevent multiple concurrent connection attempts
    if (isConnecting) {
      console.log('MongoDB connection already in progress');
      return false;
    }
    
    isConnecting = true;
    
    // Use a shorter timeout for faster connection or failure
    const connectTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('MongoDB connection timed out'));
      }, 5000);
    });
    
    // Try to connect with short timeouts
    console.log('Connecting to MongoDB with short timeout...');
    await Promise.race([
      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      }),
      connectTimeout
    ]);
    
    console.log('Connected to MongoDB successfully');
    isConnecting = false;
    mongoConnected = true;
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnecting = false;
    mongoConnected = false;
    return false;
  }
};

// Function to check if MongoDB is connected
export const isMongoDBConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Export mongoose instance for use in other files
export { mongoose };
