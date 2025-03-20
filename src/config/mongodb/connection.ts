
/**
 * This file contains MongoDB connection management functions
 */

import { mongoose } from './index';

let isConnected = false;
const DB_NAME = 'growbharatdb';

/**
 * Connect to MongoDB database directly through API
 */
export const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('=> MongoDB already connected');
    return true;
  }
  
  try {
    console.log('=> Connecting to MongoDB via API...');
    
    // Connect directly to MongoDB through API
    const uri = process.env.MONGODB_URI || 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    // Use real MongoDB connection
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, 
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    
    isConnected = true;
    console.log('=> Connected to MongoDB');
    return true;
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
