
import { connectToMongoDB, mongoose, isMongoDBConnected } from '../config/mongodb';

// Add a minimal browser check
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  // @ts-ignore - Add a minimal process polyfill for browser environments
  window.process = window.process || { env: {} };
}

// Function to auto-initialize MongoDB when needed
export const autoInitMongoDB = async () => {
  try {
    console.log("Auto-initializing MongoDB...");
    
    // Check if already connected
    if (isMongoDBConnected()) {
      console.log("MongoDB is already connected, skipping initialization");
      return true;
    }
    
    // Set a timeout to avoid hanging
    const connectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        console.log("Attempting to connect to MongoDB...");
        const connected = await connectToMongoDB();
        resolve(connected);
      } catch (error) {
        console.error("MongoDB connection error:", error);
        resolve(false);
      }
    });
    
    // Add a timeout to ensure we don't wait forever
    const timeoutPromise = new Promise<boolean>(resolve => {
      setTimeout(() => {
        console.log("MongoDB connection timeout reached");
        resolve(false);
      }, 2000); // 2 second timeout - reduced from 3 seconds
    });
    
    // Use Promise.race to either get a connection or timeout
    const connected = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (!connected) {
      console.error(`Failed to connect to MongoDB`);
      console.log("App will continue to function with static data");
      return false;
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
    
    console.log("App will continue to function with static data");
    return false;
  }
};

// Progress callback type definition
type ProgressCallback = (progress: number, message: string) => void;

// Define return type for setupMongoDB
interface SetupMongoDBResult {
  success: boolean;
  collections: string[];
  error?: string;
}

export const setupMongoDB = async (progressCallback?: ProgressCallback): Promise<SetupMongoDBResult> => {
  try {
    if (progressCallback) {
      progressCallback(10, "Connecting to MongoDB...");
    }
    console.log("Setting up MongoDB models...");
    
    // Set a timeout to ensure we don't hang if MongoDB is unavailable
    const setupPromise = new Promise<SetupMongoDBResult>(async (resolve) => {
      try {
        // Ensure MongoDB is connected first with retries
        if (!isMongoDBConnected()) {
          let connected = false;
          let attempts = 0;
          const maxAttempts = 2; // Reduced attempts to speed up fallback
          
          while (!connected && attempts < maxAttempts) {
            attempts++;
            console.log(`Connection attempt ${attempts}/${maxAttempts}...`);
            
            if (progressCallback) {
              progressCallback(15 + attempts * 5, `Connection attempt ${attempts}...`);
            }
            
            try {
              connected = await connectToMongoDB();
            } catch (error) {
              console.error(`Connection attempt ${attempts} failed:`, error);
              if (attempts < maxAttempts) {
                console.log(`Retrying in 1 second... (${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (!connected) {
            console.log("MongoDB connection failed, proceeding with static data");
            if (progressCallback) {
              progressCallback(100, "Using static data (MongoDB unavailable)");
            }
            resolve({
              success: false,
              collections: [],
              error: "MongoDB connection failed, using static data"
            });
            return;
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
        resolve({
          success: true,
          collections: collections
        });
      } catch (error) {
        console.error("Setup error:", error);
        resolve({
          success: false,
          collections: [],
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<SetupMongoDBResult>(resolve => {
      setTimeout(() => {
        if (progressCallback) {
          progressCallback(100, "Setup timed out, using static data");
        }
        console.log("MongoDB setup timed out, falling back to static data");
        resolve({
          success: false,
          collections: [],
          error: "MongoDB setup timed out"
        });
      }, 5000); // 5 second timeout
    });
    
    // Race the promises to prevent hanging
    return await Promise.race([setupPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error setting up MongoDB models:", error);
    if (progressCallback) {
      progressCallback(100, "Error setting up MongoDB models, using static data");
    }
    // Return an object even in case of error to maintain consistent return type
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
