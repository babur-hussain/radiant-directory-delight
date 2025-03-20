
import { api, isServerRunning } from '../core/apiService';

// MongoDB initialization with better error handling
export const initializeMongoDB = async () => {
  try {
    // Check if server is running first
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log("Server is not available, skipping MongoDB initialization");
      return {
        success: false,
        collections: [],
        error: "Server is not available"
      };
    }
    
    const response = await api.post('/initialize-mongodb');
    
    // Ensure we have a properly structured response even if the API returns an unexpected format
    const result = response.data;
    return {
      success: !!result.success,
      collections: result.collections || [],
      error: result.error || null
    };
  } catch (error) {
    console.error("Error initializing MongoDB:", error);
    // Return structured error response
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const testMongoDBConnection = async () => {
  try {
    // Check if server is running first
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log("Server is not available, skipping MongoDB test");
      return {
        success: false,
        message: "Server is not available"
      };
    }
    
    const response = await api.get('/test-connection');
    return {
      success: true,
      message: response.data.message || "Connection successful"
    };
  } catch (error) {
    console.error("Error testing MongoDB connection:", error);
    // Return structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
};
