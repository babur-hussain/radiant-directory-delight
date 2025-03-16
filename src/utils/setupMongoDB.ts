
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
      
      // Note: In newer mongoose versions, modelSchemas is not directly accessible
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
          // Explicitly ensure one-time payment packages have proper price set (never 0)
          const price = pkg.paymentType === "one-time" 
            ? (pkg.price && pkg.price > 0 ? pkg.price : 999) // Default to 999 if price is 0 or undefined
            : pkg.price;
            
          const packageToSave = {
            ...pkg,
            features: pkg.features || [],
            setupFee: pkg.setupFee || 0,
            monthlyPrice: pkg.monthlyPrice || 0,
            advancePaymentMonths: pkg.advancePaymentMonths || 0,
            durationMonths: pkg.durationMonths || 12,
            termsAndConditions: pkg.termsAndConditions || "",
            paymentType: pkg.paymentType || "recurring",
            price: price // Use the corrected price
          };
          
          await SubscriptionPackageModel.create(packageToSave);
          console.log(`Seeded package: ${pkg.title} with price: ${price}`);
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
    
    // Seed dummy businesses
    progressCallback?.(98, 'Seeding dummy businesses');
    try {
      // Create dummy businesses
      const BusinessModel = mongoose.model('Business');
      
      // Remove existing businesses first
      await BusinessModel.deleteMany({});
      
      // Create dummy businesses
      const dummyBusinesses = [
        {
          id: "1",
          name: "Spice Bazaar",
          category: "Restaurant",
          address: "123 Main St, Mumbai",
          phone: "9876543210",
          email: "contact@spicebazaar.com",
          website: "www.spicebazaar.com",
          description: "Authentic Indian cuisine in the heart of Mumbai.",
          rating: 4.5,
          reviews: 120,
          latitude: 19.0760,
          longitude: 72.8777,
          hours: {
            monday: "10:00 AM - 10:00 PM",
            tuesday: "10:00 AM - 10:00 PM",
            wednesday: "10:00 AM - 10:00 PM",
            thursday: "10:00 AM - 10:00 PM",
            friday: "10:00 AM - 11:00 PM",
            saturday: "10:00 AM - 11:00 PM",
            sunday: "11:00 AM - 10:00 PM"
          },
          tags: ["restaurant", "indian", "spicy", "vegetarian"],
          featured: true,
          image: "/placeholder.svg",
        },
        {
          id: "2",
          name: "Tech Solutions",
          category: "IT Services",
          address: "456 Tech Park, Bangalore",
          phone: "8765432109",
          email: "support@techsolutions.com",
          website: "www.techsolutions.com",
          description: "Professional IT services and software development.",
          rating: 4.8,
          reviews: 85,
          latitude: 12.9716,
          longitude: 77.5946,
          hours: {
            monday: "9:00 AM - 6:00 PM",
            tuesday: "9:00 AM - 6:00 PM",
            wednesday: "9:00 AM - 6:00 PM",
            thursday: "9:00 AM - 6:00 PM",
            friday: "9:00 AM - 6:00 PM",
            saturday: "10:00 AM - 2:00 PM",
            sunday: "Closed"
          },
          tags: ["it", "software", "tech", "consulting"],
          featured: false,
          image: "/placeholder.svg",
        },
        {
          id: "3",
          name: "Fashion Trends",
          category: "Retail",
          address: "789 Shopping Mall, Delhi",
          phone: "7654321098",
          email: "info@fashiontrends.com",
          website: "www.fashiontrends.com",
          description: "Latest fashion trends and accessories.",
          rating: 4.2,
          reviews: 150,
          latitude: 28.6139,
          longitude: 77.2090,
          hours: {
            monday: "11:00 AM - 9:00 PM",
            tuesday: "11:00 AM - 9:00 PM",
            wednesday: "11:00 AM - 9:00 PM",
            thursday: "11:00 AM - 9:00 PM",
            friday: "11:00 AM - 10:00 PM",
            saturday: "10:00 AM - 10:00 PM",
            sunday: "12:00 PM - 8:00 PM"
          },
          tags: ["fashion", "retail", "clothing", "accessories"],
          featured: true,
          image: "/placeholder.svg",
        }
      ];
      
      // Insert dummy businesses
      await BusinessModel.insertMany(dummyBusinesses);
      
      console.log(`Seeded ${dummyBusinesses.length} dummy businesses`);
    } catch (error) {
      console.error('Error seeding dummy businesses:', error);
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
