
import mongoose from 'mongoose';

// Updated MongoDB connection string to use MongoDB Atlas with correct database name
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

export const connectToMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return true;
    }
    
    // Add connection attempt log
    console.log('🚀 Connecting to MongoDB...');
    console.log(`MongoDB URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs
    
    // Set up connection with better error handling
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // Increased timeout for better reliability
      socketTimeoutMS: 45000, // More reasonable socket timeout
      connectTimeoutMS: 20000, // Increased connect timeout
      heartbeatFrequencyMS: 30000, // Add heartbeat to keep connection alive
      retryWrites: true, // Enable retry writes
      w: 'majority', // Write concern
    });
    
    // Add successful connection log with more details
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    
    // Add connection event listeners for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    return false;
  }
};

// Function to test specific collection access
export const testCollectionAccess = async (collectionName = 'user') => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToMongoDB();
    }
    
    // Test if we can access the collection
    const count = await mongoose.connection.db.collection(collectionName).countDocuments();
    console.log(`✅ Successfully accessed collection '${collectionName}' with ${count} documents`);
    return {
      success: true,
      count,
      collection: collectionName
    };
  } catch (error) {
    console.error(`❌ Error accessing collection '${collectionName}':`, error);
    return {
      success: false,
      error: error.message,
      collection: collectionName
    };
  }
};

export default mongoose;
