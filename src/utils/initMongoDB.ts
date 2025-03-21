
// Replace SubscriptionPackage with ISubscriptionPackage
import { IUser } from '../models/User';
import { ISubscriptionPackage } from '../models/SubscriptionPackage';
import mongoose from 'mongoose';

const initMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default initMongoDB;
