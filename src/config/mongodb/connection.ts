
/**
 * This file contains MongoDB connection management functions
 */

import { mongoose } from './index';

let isConnected = false;
const MOCK_DB_NAME = 'growbharatdb';

/**
 * Connect to MongoDB database
 * In mock mode, this simply sets a flag
 */
export const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('=> MongoDB already connected');
    return true;
  }
  
  try {
    if (mongoose.connection.readyState === 0) {
      // Real MongoDB connection logic would go here
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/growbharatdb';
      await mongoose.connect(uri);
      isConnected = true;
      console.log('=> Connected to MongoDB');
      return true;
    } else {
      // Already connected or mock connection
      console.log('=> Using MongoDB mock implementation');
      isConnected = true;
      return true;
    }
  } catch (error) {
    console.error('=> MongoDB connection error:', error);
    isConnected = false;
    return false;
  }
};

/**
 * Check if MongoDB is connected
 */
export const isMongoDB_Connected = () => {
  return isConnected;
};

// Alias for compatibility with existing code
export const isMongoDBConnected = isMongoDB_Connected;
