
import { initializeMongoDB, testMongoDBConnection, isServerRunning } from '../api/mongoAPI';

// Progress callback type definition
type ProgressCallback = (progress: number, message: string) => void;

// Define return type for setupMongoDB
interface SetupMongoDBResult {
  success: boolean;
  collections: any; // Changed to any to accommodate both array and object formats
  error?: string;
}

// Function to test connection with retry
export const testConnectionWithRetry = async (maxAttempts: number, delayMs: number): Promise<boolean> => {
  let attempts = 0;
  
  // First check if server is even running
  const serverAvailable = await isServerRunning();
  if (!serverAvailable) {
    console.log('Server is not available, skipping connection test');
    return false;
  }
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`MongoDB connection attempt ${attempts}/${maxAttempts}...`);
    
    try {
      const result = await testMongoDBConnection();
      if (result.success) {
        console.log('✅ MongoDB connection successful');
        return true;
      }
    } catch (error) {
      console.error(`Connection attempt ${attempts} failed:`, error);
    }
    
    if (attempts < maxAttempts) {
      console.log(`Retrying in ${delayMs/1000} seconds... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
  return false;
};

// Main setup function
export const setupMongoDB = async (progressCallback?: ProgressCallback): Promise<SetupMongoDBResult> => {
  try {
    if (progressCallback) {
      progressCallback(10, "Testing MongoDB connection...");
    }
    
    // Check if server is running with shorter timeout
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      if (progressCallback) {
        progressCallback(100, "MongoDB server is not available");
      }
      return {
        success: false,
        collections: [],
        error: "MongoDB server is not available. Using fallback local data."
      };
    }
    
    // Only attempt connection if server is available
    const connectionResult = await testConnectionWithRetry(1, 1000); // Reduced retries for faster fallback
    
    if (!connectionResult) {
      if (progressCallback) {
        progressCallback(100, "Failed to connect to MongoDB");
      }
      return {
        success: false,
        collections: [],
        error: "Failed to connect to MongoDB. Using fallback local data."
      };
    }
    
    if (progressCallback) {
      progressCallback(50, "Initializing MongoDB collections...");
    }
    
    // Initialize MongoDB collections through API
    const result = await initializeMongoDB();
    
    if (progressCallback) {
      progressCallback(100, "MongoDB initialization complete");
    }
    
    return {
      success: result.success,
      collections: result.collections || [],
      error: result.error
    };
  } catch (error) {
    console.error("Error setting up MongoDB:", error);
    
    if (progressCallback) {
      progressCallback(100, "Error setting up MongoDB");
    }
    
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Auto-initialize MongoDB when needed - simplified version for client
export const autoInitMongoDB = async (): Promise<boolean> => {
  try {
    // Check if server is running first with a short timeout
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log("Server is not available, skipping auto-initialization");
      return false;
    }
    
    console.log("Testing MongoDB connection through API...");
    const connectionResult = await testMongoDBConnection();
    
    if (!connectionResult.success) {
      console.log("MongoDB connection failed, attempting initialization...");
      
      // Try to initialize
      const initResult = await initializeMongoDB();
      return initResult.success;
    }
    
    return true;
  } catch (error) {
    console.error("Error during MongoDB auto-initialization:", error);
    return false;
  }
};
