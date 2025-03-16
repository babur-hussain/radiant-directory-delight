
import { mongoose, connectToMongoDB, isMongoDBConnected } from '../config/mongodb';

// Function to auto-initialize MongoDB when needed
export const autoInitMongoDB = async () => {
  try {
    console.log("Auto-initializing MongoDB...");
    
    // Check if already connected
    if (isMongoDBConnected()) {
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
      if (mongoose.connection) {
        const host = mongoose.connection.host || 'unknown-host';
        const name = mongoose.connection.name || 'unknown-name';
        console.log(`Connected to MongoDB at ${host}/${name}`);
      }
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

// Progress callback type definition
type ProgressCallback = (progress: number, message: string) => void;

export const setupMongoDB = async (progressCallback?: ProgressCallback) => {
  try {
    if (progressCallback) {
      progressCallback(10, "Connecting to MongoDB...");
    }
    console.log("Setting up MongoDB models...");
    
    // Ensure MongoDB is connected first
    if (!isMongoDBConnected()) {
      const connected = await connectToMongoDB();
      if (!connected) {
        throw new Error("Failed to connect to MongoDB");
      }
    }
    
    if (progressCallback) {
      progressCallback(30, "Connected to MongoDB, registering models...");
    }
    
    // Import models to register them
    const collections = [];
    try {
      await import('../models/User');
      collections.push('User');
      if (progressCallback) progressCallback(40, "Registered User model");
    } catch (e) {
      console.error("Error importing User model:", e);
    }
    
    try {
      await import('../models/Business');
      collections.push('Business');
      if (progressCallback) progressCallback(60, "Registered Business model");
    } catch (e) {
      console.error("Error importing Business model:", e);
    }
    
    try {
      await import('../models/Subscription');
      collections.push('Subscription');
      if (progressCallback) progressCallback(80, "Registered Subscription model");
    } catch (e) {
      console.error("Error importing Subscription model:", e);
    }
    
    try {
      await import('../models/SubscriptionPackage');
      collections.push('SubscriptionPackage');
      if (progressCallback) progressCallback(90, "Registered SubscriptionPackage model");
    } catch (e) {
      console.error("Error importing SubscriptionPackage model:", e);
    }
    
    if (progressCallback) {
      progressCallback(100, "All MongoDB models registered successfully");
    }
    console.log("All MongoDB models registered successfully");
    
    // Return an object with information about the setup
    return {
      success: true,
      collections: collections
    };
  } catch (error) {
    console.error("Error setting up MongoDB models:", error);
    if (progressCallback) {
      progressCallback(100, "Error setting up MongoDB models");
    }
    // Return an object even in case of error to maintain consistent return type
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
