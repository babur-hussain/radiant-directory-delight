
import mongoose from 'mongoose';

// Use the updated connection string provided by the user
const MONGODB_URI = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize connection variable
let isConnecting = false;
let mongoConnected = false;

// Initialize MongoDB connection
export const connectToMongoDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      mongoConnected = true;
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
    console.log('Connecting to MongoDB...', MONGODB_URI);
    
    // Connect to MongoDB with improved options
    await mongoose.connect(MONGODB_URI);
    
    isConnecting = false;
    mongoConnected = true;
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
    mongoConnected = false;
    console.error('MongoDB connection error:', error);
    
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return false;
  }
};

// Function to check if MongoDB is connected
export const isMongoDBConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Export mongoose for use in other files
export default mongoose;
