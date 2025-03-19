
import { connectToMongoDB, mongoose } from '../config/mongodb';
import dns from 'dns';
import { isServerRunning } from '../api/mongoAPI';

export const diagnoseMongoDbConnection = async () => {
  console.log("Starting MongoDB connection diagnostics...");
  
  // Check if Node.js environment
  const isNodeEnv = typeof process !== 'undefined' && process.versions && process.versions.node;
  console.log(`Running in ${isNodeEnv ? 'Node.js' : 'Browser'} environment`);
  
  // Check if server is available
  const serverRunning = await isServerRunning();
  console.log(`MongoDB server available: ${serverRunning ? 'Yes' : 'No'}`);
  
  // Get MongoDB URI
  const uri = typeof process !== 'undefined' && process.env.MONGODB_URI 
    ? process.env.MONGODB_URI 
    : 'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  // Parse the URI
  try {
    console.log("Parsing MongoDB URI...");
    const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@'); // Hide password
    console.log("URI (sanitized):", sanitizedUri);
    
    // Extract host from URI
    const hostMatch = uri.match(/@([^/:]+)/);
    const host = hostMatch ? hostMatch[1] : null;
    
    if (host && isNodeEnv) {
      // Try DNS lookup if in Node environment
      try {
        console.log(`Performing DNS lookup for ${host}...`);
        dns.lookup(host, (err, address) => {
          if (err) {
            console.error(`DNS lookup failed: ${err.message}`);
          } else {
            console.log(`DNS resolved ${host} to ${address}`);
          }
        });
      } catch (dnsError) {
        console.error("DNS lookup error:", dnsError);
      }
    }
  } catch (parseError) {
    console.error("Error parsing MongoDB URI:", parseError);
  }
  
  // Check current connection state
  const connectionState = mongoose.connection ? mongoose.connection.readyState : 99;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  console.log(`Current connection state: ${connectionState} (${stateMap[connectionState as keyof typeof stateMap] || 'unknown'})`);
  
  // Try establishing a connection
  try {
    console.log("Attempting test connection...");
    const connected = await connectToMongoDB();
    console.log(`Test connection ${connected ? 'succeeded' : 'failed'}`);
    
    if (connected && mongoose.connection) {
      // Try a simple query - make this browser-compatible
      try {
        console.log("Connection is established, but skipping admin ping in browser environment");
        // In a browser environment, we can't do DB admin pings, so we just log success
        console.log("Connection verification completed");
      } catch (pingError) {
        console.error("Error verifying connection:", pingError);
      }
    }
  } catch (connError) {
    console.error("Error during test connection:", connError);
  }
  
  return {
    environment: isNodeEnv ? 'Node.js' : 'Browser',
    connectionState: stateMap[connectionState as keyof typeof stateMap] || 'unknown',
    uri: uri.replace(/:([^:@]+)@/, ':****@'), // Hide password
    serverRunning
  };
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
