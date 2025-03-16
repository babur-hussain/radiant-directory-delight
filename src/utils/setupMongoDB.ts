
import { connectToMongoDB } from '../config/mongodb';
import mongoose from '../config/mongodb';
import { SubscriptionPackage } from '../models/SubscriptionPackage';
import { Business } from '../models/Business';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { businessPackages, influencerPackages } from '@/data/subscriptionData';

/**
 * Sets up MongoDB collections and schema without migrating data
 */
export const setupMongoDB = async (
  progressCallback?: (progress: number, message: string) => void
): Promise<{ success: boolean; collections: string[] }> => {
  try {
    // Update progress
    progressCallback?.(0, 'Connecting to MongoDB');
    
    // Connect to MongoDB
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    progressCallback?.(10, 'Connected to MongoDB');
    
    // Verify/create necessary collections
    const collections = [];
    
    // 1. Verify User collection is properly set up
    progressCallback?.(20, 'Setting up User collection');
    try {
      await User.createCollection();
      collections.push('users');
    } catch (error) {
      // Collection might already exist
      console.log('User collection already exists');
      collections.push('users');
    }
    
    // 2. Verify Business collection is properly set up
    progressCallback?.(35, 'Setting up Business collection');
    try {
      await Business.createCollection();
      collections.push('businesses');
    } catch (error) {
      // Collection might already exist
      console.log('Business collection already exists');
      collections.push('businesses');
    }
    
    // 3. Verify SubscriptionPackage collection is properly set up
    progressCallback?.(50, 'Setting up SubscriptionPackage collection');
    try {
      await SubscriptionPackage.createCollection();
      collections.push('subscriptionpackages');
    } catch (error) {
      // Collection might already exist
      console.log('SubscriptionPackage collection already exists');
      collections.push('subscriptionpackages');
    }
    
    // 4. Verify Subscription collection is properly set up
    progressCallback?.(65, 'Setting up Subscription collection');
    try {
      await Subscription.createCollection();
      collections.push('subscriptions');
    } catch (error) {
      // Collection might already exist
      console.log('Subscription collection already exists');
      collections.push('subscriptions');
    }
    
    // 5. Setup default subscription packages if none exist
    progressCallback?.(80, 'Setting up default subscription packages');
    const packageCount = await SubscriptionPackage.countDocuments();
    
    if (packageCount === 0) {
      console.log('No subscription packages found, seeding default packages...');
      
      // Combine business and influencer packages
      const allPackages = [...businessPackages, ...influencerPackages];
      
      // Add each package to MongoDB
      for (const pkg of allPackages) {
        try {
          await SubscriptionPackage.create({
            ...pkg,
            features: pkg.features || []
          });
          console.log(`Seeded package: ${pkg.title}`);
        } catch (err) {
          console.error(`Error seeding package ${pkg.title}:`, err);
        }
      }
    }
    
    // 6. Create indexes
    progressCallback?.(95, 'Creating database indexes');
    await User.ensureIndexes();
    await Business.ensureIndexes();
    await SubscriptionPackage.ensureIndexes();
    await Subscription.ensureIndexes();
    
    progressCallback?.(100, 'MongoDB setup completed');
    
    return {
      success: true,
      collections
    };
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
    throw error;
  }
};

/**
 * Automatically initialize MongoDB on application startup
 * This function will be called when the app loads
 */
export const autoInitMongoDB = async (): Promise<void> => {
  console.log('Auto-initializing MongoDB...');
  try {
    const result = await setupMongoDB();
    console.log('MongoDB auto-initialization completed:', result);
  } catch (error) {
    console.error('Error during MongoDB auto-initialization:', error);
  }
};
