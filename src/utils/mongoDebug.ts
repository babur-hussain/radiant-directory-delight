
import { connectToMongoDB, mongoose, isMongoDB_Connected } from '@/config/mongodb';
import { getEnvironment } from './environment';

export const diagnoseMongoDbConnection = async () => {
  const environment = getEnvironment();
  
  try {
    // First attempt connection
    let isConnected = false;
    try {
      await connectToMongoDB();
      isConnected = isMongoDB_Connected();
    } catch (e) {
      console.error("Connection error during diagnostics:", e);
    }
    
    let connectionState = "unknown";
    
    // Check if we're connected
    if (isConnected) {
      connectionState = "connected";
    } else {
      connectionState = "disconnected";
    }
    
    // Get connection details if available
    let connectionDetails = {};
    try {
      // Access connection properties safely using optional chaining
      connectionDetails = {
        readyState: mongoose.connection?.readyState || 0,
        host: mongoose.connection?.host || 'unknown',
        name: mongoose.connection?.name || 'unknown'
      };
    } catch (e) {
      console.error("Error accessing connection details:", e);
    }
    
    // Format the URI for display (remove credentials)
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/default';
    const displayUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    
    return {
      environment,
      connectionState,
      uri: displayUri,
      details: connectionDetails,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in diagnoseMongoDbConnection:", error);
    return {
      environment,
      connectionState: "error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

export const testConnectionWithRetry = async (maxAttempts = 3, delayMs = 2000) => {
  let attempts = 0;
  let connected = false;
  
  while (!connected && attempts < maxAttempts) {
    attempts++;
    console.log(`Connection attempt ${attempts}/${maxAttempts}...`);
    
    try {
      connected = await connectToMongoDB();
      
      if (connected) {
        console.log(`Successfully connected on attempt ${attempts}`);
        return true;
      } else {
        console.log(`Connection attempt ${attempts} failed`);
      }
    } catch (error) {
      console.error(`Error on connection attempt ${attempts}:`, error);
    }
    
    if (!connected && attempts < maxAttempts) {
      console.log(`Waiting ${delayMs}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log(`All ${maxAttempts} connection attempts failed`);
  return false;
};
