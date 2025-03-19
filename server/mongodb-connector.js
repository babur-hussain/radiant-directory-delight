
import mongoose from 'mongoose';

// Updated MongoDB connection string to use MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://growbharatvyapaar:bharat123@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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
      serverSelectionTimeoutMS: 15000, // Increased timeout for better reliability
      socketTimeoutMS: 45000, // More reasonable socket timeout
      connectTimeoutMS: 15000, // Reduced connect timeout
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

export default mongoose;
