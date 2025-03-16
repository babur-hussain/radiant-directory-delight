
import * as mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://growbharatvyapaar:KShEQVp120dMJGvr@cluster0.08wsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Initialize MongoDB connection
export const connectToMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return true;
    }
    
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

// Don't automatically connect here as it can cause issues in some environments
// connectToMongoDB();
