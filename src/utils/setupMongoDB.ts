
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
    
    // Clear mongoose model cache to prevent schema registration errors
    try {
      // Unregister all models to avoid "Cannot overwrite model once compiled" errors
      Object.keys(mongoose.models).forEach(modelName => {
        delete mongoose.models[modelName];
      });
      
      // In newer mongoose versions, modelSchemas is not directly accessible
      // We'll just rely on clearing the models which is sufficient
    } catch (cacheError) {
      console.error('Error clearing mongoose model cache:', cacheError);
    }
    
    // Verify/create necessary collections
    const collections = [];
    
    progressCallback?.(20, 'Setting up User collection');
    try {
      // Ensure the model is registered before creating collection
      const UserModel = mongoose.model('User', User.schema);
      await UserModel.createCollection();
      console.log('User collection created successfully');
      collections.push('users');
    } catch (error) {
      console.error('Error creating User collection:', error);
      // Collection might already exist, try to continue
      collections.push('users');
    }
    
    progressCallback?.(35, 'Setting up Business collection');
    try {
      // Ensure the model is registered
      const BusinessModel = mongoose.model('Business', Business.schema);
      await BusinessModel.createCollection();
      console.log('Business collection created successfully');
      collections.push('businesses');
    } catch (error) {
      console.error('Error creating Business collection:', error);
      collections.push('businesses');
    }
    
    progressCallback?.(50, 'Setting up SubscriptionPackage collection');
    try {
      // Ensure the model is registered
      const SubscriptionPackageModel = mongoose.model('SubscriptionPackage', SubscriptionPackage.schema);
      await SubscriptionPackageModel.createCollection();
      console.log('SubscriptionPackage collection created successfully');
      collections.push('subscriptionpackages');
    } catch (error) {
      console.error('Error creating SubscriptionPackage collection:', error);
      collections.push('subscriptionpackages');
    }
    
    progressCallback?.(65, 'Setting up Subscription collection');
    try {
      // Ensure the model is registered
      const SubscriptionModel = mongoose.model('Subscription', Subscription.schema);
      await SubscriptionModel.createCollection();
      console.log('Subscription collection created successfully');
      collections.push('subscriptions');
    } catch (error) {
      console.error('Error creating Subscription collection:', error);
      collections.push('subscriptions');
    }
    
    // Setup default subscription packages - first delete all existing packages
    progressCallback?.(80, 'Setting up default subscription packages');
    try {
      const SubscriptionPackageModel = mongoose.model('SubscriptionPackage');
      
      // Remove all existing packages to start fresh
      await SubscriptionPackageModel.deleteMany({});
      console.log('Deleted all existing subscription packages');
      
      // Combine business and influencer packages
      const allPackages = [...businessPackages, ...influencerPackages];
      
      // Add each package to MongoDB
      const seedPromises = allPackages.map(async (pkg) => {
        try {
          await SubscriptionPackageModel.create({
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
          return true;
        } catch (err) {
          console.error(`Error seeding package ${pkg.title}:`, err);
          return false;
        }
      });
      
      await Promise.all(seedPromises);
      
      // Verify packages were created
      const packageCount = await SubscriptionPackageModel.countDocuments();
      console.log(`Created ${packageCount} subscription packages`);
    } catch (error) {
      console.error('Error setting up subscription packages:', error);
      throw new Error(`Failed to seed subscription packages: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Create indexes
    progressCallback?.(95, 'Creating database indexes');
    try {
      console.log('Creating indexes for collections');
      
      // Create indexes manually instead of using syncIndexes
      const UserModel = mongoose.model('User');
      await UserModel.collection.createIndex({ uid: 1 }, { unique: true });
      await UserModel.collection.createIndex({ email: 1 });
      
      const BusinessModel = mongoose.model('Business');
      await BusinessModel.collection.createIndex({ id: 1 }, { unique: true });
      await BusinessModel.collection.createIndex({ name: 1 });
      
      const SubscriptionPackageModel = mongoose.model('SubscriptionPackage');
      await SubscriptionPackageModel.collection.createIndex({ id: 1 }, { unique: true });
      await SubscriptionPackageModel.collection.createIndex({ type: 1 });
      
      const SubscriptionModel = mongoose.model('Subscription');
      await SubscriptionModel.collection.createIndex({ id: 1 }, { unique: true });
      await SubscriptionModel.collection.createIndex({ userId: 1 });
      
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
