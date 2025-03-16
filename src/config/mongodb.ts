
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://growbharatvyapaar:KShEQVp120dMJGvr@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize MongoDB connection
export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Export mongoose for use in other files
export { mongoose };

// Call this function when app initializes
connectToMongoDB();
