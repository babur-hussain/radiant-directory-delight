
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
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout for better reliability
      socketTimeoutMS: 75000, // Increased socket timeout
      connectTimeoutMS: 30000, // Added connect timeout
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    return false;
  }
};

export default mongoose;
