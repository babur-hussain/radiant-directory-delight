
import mongoose from 'mongoose';

// Use the updated connection string provided by the user
const MONGODB_URI = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize connection variables
let isConnecting = false;
let mongoConnected = false;
let connectAttempts = 0;

// Initialize MongoDB connection with better error handling
export const connectToMongoDB = async () => {
  try {
    // Only allow 1 connection attempt to prevent app hanging
    if (connectAttempts >= 1) {
      console.log('Maximum MongoDB connection attempts reached, proceeding with local data');
      return false;
    }
    
    connectAttempts++;
    
    // Check if already connected - 1 represents connected state in mongoose
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
    console.log('Connecting to MongoDB...', MONGODB_URI);
    
    // Connect to MongoDB with improved options and shorter timeouts
    const connectPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 1000, // Much shorter timeout (1s)
      socketTimeoutMS: 1000, // Close sockets after 1s of inactivity
    });
    
    // Add a timeout to ensure we don't hang waiting for MongoDB
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('MongoDB connection timeout'));
      }, 1000); // 1 second timeout - even shorter
    });
    
    // Race the connection against the timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    isConnecting = false;
    mongoConnected = true;
    console.log('Connected to MongoDB successfully');
    
    return true;
  } catch (error) {
    isConnecting = false;
    mongoConnected = false;
    console.error('MongoDB connection error:', error);
    
    // More detailed error logging but don't let it block the app
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
    }
    
    return false;
  } finally {
    // Always reset connecting flag in case of any error path
    isConnecting = false;
  }
};

// Function to check if MongoDB is connected
export const isMongoDBConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Export mongoose instance for use in other files
export { mongoose };
