
import { connectToMongoDB, mongoose } from '../config/mongodb';
import { ISubscriptionPackage, SubscriptionPackage } from '../models/SubscriptionPackage';
import { businessPackages, influencerPackages } from '@/data/subscriptionData';

export const initializeMongoDB = async () => {
  try {
    console.log('Initializing MongoDB connection...');
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB during initialization');
      return false;
    }
    
    console.log('MongoDB connection established');
    
    // Seed default packages if none exist
    const packageCount = await SubscriptionPackage.countDocuments();
    
    if (packageCount === 0) {
      console.log('No subscription packages found, seeding default packages...');
      
      // Combine business and influencer packages
      const allPackages = [...businessPackages, ...influencerPackages];
      
      // Add each package to MongoDB
      const seedPromises = allPackages.map(async (pkg) => {
        try {
          await SubscriptionPackage.create({
            ...pkg,
            features: pkg.features || []
          });
          console.log(`Seeded package: ${pkg.title}`);
        } catch (err) {
          console.error(`Error seeding package ${pkg.title}:`, err);
        }
      });
      
      await Promise.all(seedPromises);
      console.log('Default packages seeded successfully');
    } else {
      console.log(`Found ${packageCount} existing subscription packages, skipping seed`);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    return false;
  }
};
