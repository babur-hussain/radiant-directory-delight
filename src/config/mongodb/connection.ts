
/**
 * This file contains MongoDB connection management functions
 */

import { mongoose } from './index';

let isConnected = false;
const DB_NAME = 'growbharatdb';
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Connect to MongoDB database directly through API
 */
export const connectToMongoDB = async () => {
  if (isConnected) {
    console.log('=> MongoDB already connected');
    return true;
  }
  
  if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
    console.log('=> Maximum MongoDB connection attempts reached, using local mode');
    return false;
  }
  
  connectionAttempts++;
  
  try {
    console.log('=> Connecting to MongoDB via API...');
    
    // Connect directly to MongoDB through API
    const uri = process.env.MONGODB_URI || 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    // Use the mongoose connect method with modern options
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout for connection
    });
    
    isConnected = true;
    console.log('=> Connected to MongoDB');
    // Reset connection attempts on success
    connectionAttempts = 0;
    return true;
  } catch (error) {
    console.error('=> MongoDB connection error:', error);
    isConnected = false;
    
    // If we've reached max attempts, we'll switch to local mode
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      console.warn('=> Maximum connection attempts reached. Switching to local storage mode.');
    } else {
      console.warn(`=> Connection attempt ${connectionAttempts} of ${MAX_RETRY_ATTEMPTS} failed.`);
    }
    
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

// Reset connection attempts - useful when we want to try again after waiting
export const resetConnectionAttempts = () => {
  connectionAttempts = 0;
  console.log('=> MongoDB connection attempts reset');
};
