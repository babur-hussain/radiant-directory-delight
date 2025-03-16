
import mongoose from 'mongoose';

// Use a fallback connection string if environment variables are not available
const MONGODB_URI = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb+srv://growbharatvyapaar:KShEQVp120dMJGvr@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize connection variable
let isConnecting = false;

// Initialize MongoDB connection
export const connectToMongoDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return true;
    }
    
    // Prevent multiple concurrent connection attempts
    if (isConnecting) {
      console.log('MongoDB connection already in progress');
      // Wait for the connection to complete
      let attempts = 0;
      while (isConnecting && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      return mongoose.connection && mongoose.connection.readyState === 1;
    }
    
    isConnecting = true;
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with improved options
    await mongoose.connect(MONGODB_URI, {
      // These options help with connection stability
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    isConnecting = false;
    console.log('Connected to MongoDB successfully');
    
    // Log connection details
    if (mongoose.connection) {
      const host = mongoose.connection.host || 'unknown-host';
      const name = mongoose.connection.name || 'unknown-name';
      console.log(`MongoDB connection details: ${host}/${name}`);
    }
    
    return true;
  } catch (error) {
    isConnecting = false;
    console.error('MongoDB connection error:', error);
    
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return false;
  }
};

// Export mongoose for use in other files
export default mongoose;
