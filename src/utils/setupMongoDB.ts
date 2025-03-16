
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
    
    // Force drop all existing collections to ensure clean state
    try {
      console.log('FORCE DROPPING all existing collections to ensure clean state');
      const db = mongoose.connection.db;
      if (db) {
        // Get list of all collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('Found collections:', collectionNames);
        
        // Drop each collection individually
        for (const collName of collectionNames) {
          if (collName !== 'system.indexes' && collName !== 'system.users') {
            try {
              console.log(`Dropping collection: ${collName}`);
              await db.dropCollection(collName);
              console.log(`Successfully dropped ${collName}`);
            } catch (dropError) {
              console.error(`Error dropping collection ${collName}:`, dropError);
            }
          }
        }
      }
    } catch (error) {
      console.log('Error dropping collections (continuing anyway):', error);
    }
    
    // Verify/create necessary collections
    const collections = [];
    
    progressCallback?.(20, 'Setting up User collection');
    try {
      await User.createCollection();
      console.log('User collection created successfully');
      collections.push('users');
    } catch (error) {
      console.error('Error creating User collection:', error);
      // Collection might already exist, try to continue
      collections.push('users');
    }
    
    progressCallback?.(35, 'Setting up Business collection');
    try {
      await Business.createCollection();
      console.log('Business collection created successfully');
      collections.push('businesses');
    } catch (error) {
      console.error('Error creating Business collection:', error);
      // Collection might already exist, try to continue
      collections.push('businesses');
    }
    
    progressCallback?.(50, 'Setting up SubscriptionPackage collection');
    try {
      await SubscriptionPackage.createCollection();
      console.log('SubscriptionPackage collection created successfully');
      collections.push('subscriptionpackages');
    } catch (error) {
      console.error('Error creating SubscriptionPackage collection:', error);
      // Collection might already exist, try to continue
      collections.push('subscriptionpackages');
    }
    
    progressCallback?.(65, 'Setting up Subscription collection');
    try {
      await Subscription.createCollection();
      console.log('Subscription collection created successfully');
      collections.push('subscriptions');
    } catch (error) {
      console.error('Error creating Subscription collection:', error);
      // Collection might already exist, try to continue
      collections.push('subscriptions');
    }
    
    // Setup default subscription packages - first delete all existing packages
    progressCallback?.(80, 'Setting up default subscription packages');
    try {
      // Remove all existing packages to start fresh
      await SubscriptionPackage.deleteMany({});
      console.log('Deleted all existing subscription packages');
      
      // Combine business and influencer packages
      const allPackages = [...businessPackages, ...influencerPackages];
      
      // Add each package to MongoDB
      for (const pkg of allPackages) {
        try {
          await SubscriptionPackage.create({
            ...pkg,
            features: pkg.features || [],
            setupFee: pkg.setupFee || 0,
            monthlyPrice: pkg.monthlyPrice || 0,
            advancePaymentMonths: pkg.advancePaymentMonths || 0,
            durationMonths: pkg.durationMonths || 12,
            termsAndConditions: pkg.termsAndConditions || "",
            paymentType: pkg.paymentType || "recurring"
          });
          console.log(`Seeded package: ${pkg.title}`);
        } catch (err) {
          console.error(`Error seeding package ${pkg.title}:`, err);
        }
      }
      
      // Verify packages were created
      const packageCount = await SubscriptionPackage.countDocuments();
      console.log(`Created ${packageCount} subscription packages`);
    } catch (error) {
      console.error('Error setting up subscription packages:', error);
    }
    
    // Create indexes
    progressCallback?.(95, 'Creating database indexes');
    try {
      console.log('Creating indexes for collections');
      await User.syncIndexes();
      await Business.syncIndexes();
      await SubscriptionPackage.syncIndexes();
      await Subscription.syncIndexes();
      console.log('Indexes successfully created');
    } catch (indexError) {
      console.error('Error creating indexes:', indexError);
    }
    
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
export const autoInitMongoDB = async (): Promise<{ success: boolean; collections: string[] }> => {
  console.log('Auto-initializing MongoDB...');
  try {
    const result = await setupMongoDB();
    console.log('MongoDB auto-initialization completed:', result);
    return result;
  } catch (error) {
    console.error('Error during MongoDB auto-initialization:', error);
    throw error;
  }
};
