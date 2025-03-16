
import mongoose from 'mongoose';
import { connectToMongoDB } from '../config/mongodb';

// Function to auto-initialize MongoDB when needed
export const autoInitMongoDB = async () => {
  try {
    console.log("Auto-initializing MongoDB...");
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB is already connected, skipping initialization");
      return true;
    }
    
    console.log("Attempting to connect to MongoDB...");
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error("Failed to connect to MongoDB");
      throw new Error("MongoDB connection failed");
    }
    
    console.log("MongoDB connection established successfully");
    
    // Try to log connection details for debugging
    try {
      const host = mongoose.connection.host;
      const name = mongoose.connection.name;
      console.log(`Connected to MongoDB at ${host}/${name}`);
    } catch (infoError) {
      console.warn("Could not log connection details:", infoError);
    }
    
    return true;
  } catch (error) {
    console.error("Error during MongoDB auto-initialization:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    return false;
  }
};

export const setupMongoDB = async () => {
  try {
    console.log("Setting up MongoDB models...");
    
    // Ensure MongoDB is connected first
    await autoInitMongoDB();
    
    // Import models to register them
    await import('../models/User');
    await import('../models/Business');
    await import('../models/Subscription');
    await import('../models/SubscriptionPackage');
    
    console.log("All MongoDB models registered successfully");
    return true;
  } catch (error) {
    console.error("Error setting up MongoDB models:", error);
    return false;
  }
};
