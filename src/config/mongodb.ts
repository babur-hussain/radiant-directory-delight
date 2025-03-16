
import mongoose from 'mongoose';

// Use a fallback connection string if environment variables are not available
const MONGODB_URI = typeof process !== 'undefined' && process.env && process.env.MONGODB_URI 
  ? process.env.MONGODB_URI 
  : 'mongodb+srv://growbharatvyapaar:KShEQVp120dMJGvr@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize MongoDB connection
export const connectToMongoDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return true;
    }
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Export mongoose for use in other files
export default mongoose;
