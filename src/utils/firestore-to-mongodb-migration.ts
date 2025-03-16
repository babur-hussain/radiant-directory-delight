
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { connectToMongoDB } from '../config/mongodb';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { SubscriptionPackage } from '../models/SubscriptionPackage';
import { Business } from '../models/Business';

// Function to migrate users from Firestore to MongoDB
const migrateUsers = async () => {
  try {
    console.log('Starting migration of users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('No users to migrate');
      return 0;
    }
    
    let count = 0;
    const promises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = userData.createdAt ? new Date(userData.createdAt.toDate()) : new Date();
      const lastLogin = userData.lastLogin ? new Date(userData.lastLogin.toDate()) : new Date();
      
      // Create or update user in MongoDB
      await User.findOneAndUpdate(
        { uid: doc.id },
        {
          uid: doc.id,
          name: userData.name || null,
          email: userData.email || null,
          role: userData.role || null,
          isAdmin: userData.isAdmin || false,
          photoURL: userData.photoURL || null,
          createdAt: createdAt,
          lastLogin: lastLogin
        },
        { upsert: true }
      );
      
      count++;
    });
    
    await Promise.all(promises);
    console.log(`Successfully migrated ${count} users`);
    return count;
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
};

// Function to migrate subscription packages from Firestore to MongoDB
const migrateSubscriptionPackages = async () => {
  try {
    console.log('Starting migration of subscription packages...');
    const packagesSnapshot = await getDocs(collection(db, 'subscriptionPackages'));
    
    if (packagesSnapshot.empty) {
      console.log('No subscription packages to migrate');
      return 0;
    }
    
    let count = 0;
    const promises = packagesSnapshot.docs.map(async (doc) => {
      const packageData = doc.data();
      
      // Create or update package in MongoDB
      await SubscriptionPackage.findOneAndUpdate(
        { id: doc.id },
        {
          id: doc.id,
          title: packageData.title || '',
          price: Number(packageData.price || 0),
          monthlyPrice: Number(packageData.monthlyPrice || 0),
          setupFee: Number(packageData.setupFee || 0),
          durationMonths: Number(packageData.durationMonths || 12),
          shortDescription: packageData.shortDescription || '',
          fullDescription: packageData.fullDescription || '',
          features: Array.isArray(packageData.features) ? packageData.features : [],
          popular: Boolean(packageData.popular),
          type: packageData.type || 'Business',
          termsAndConditions: packageData.termsAndConditions || '',
          paymentType: packageData.paymentType || 'recurring',
          billingCycle: packageData.billingCycle || 'yearly',
          advancePaymentMonths: Number(packageData.advancePaymentMonths || 0)
        },
        { upsert: true }
      );
      
      count++;
    });
    
    await Promise.all(promises);
    console.log(`Successfully migrated ${count} subscription packages`);
    return count;
  } catch (error) {
    console.error('Error migrating subscription packages:', error);
    throw error;
  }
};

// Function to migrate subscriptions from Firestore to MongoDB
const migrateSubscriptions = async () => {
  try {
    console.log('Starting migration of subscriptions...');
    const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
    
    if (subscriptionsSnapshot.empty) {
      console.log('No subscriptions to migrate');
      return 0;
    }
    
    let count = 0;
    const promises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscriptionData = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = subscriptionData.createdAt ? new Date(subscriptionData.createdAt.toDate()) : new Date();
      const updatedAt = subscriptionData.updatedAt ? new Date(subscriptionData.updatedAt.toDate()) : new Date();
      
      // Create or update subscription in MongoDB
      await Subscription.findOneAndUpdate(
        { id: doc.id },
        {
          id: doc.id,
          userId: subscriptionData.userId || '',
          packageId: subscriptionData.packageId || '',
          packageName: subscriptionData.packageName || '',
          amount: Number(subscriptionData.amount || 0),
          startDate: subscriptionData.startDate || new Date().toISOString(),
          endDate: subscriptionData.endDate || new Date().toISOString(),
          status: subscriptionData.status || 'active',
          createdAt: createdAt,
          updatedAt: updatedAt,
          assignedBy: subscriptionData.assignedBy || 'admin',
          assignedAt: subscriptionData.assignedAt || new Date().toISOString(),
          advancePaymentMonths: Number(subscriptionData.advancePaymentMonths || 0),
          signupFee: Number(subscriptionData.signupFee || 0),
          actualStartDate: subscriptionData.actualStartDate || new Date().toISOString(),
          isPaused: Boolean(subscriptionData.isPaused),
          isPausable: subscriptionData.isPausable !== undefined ? subscriptionData.isPausable : true,
          isUserCancellable: subscriptionData.isUserCancellable !== undefined ? subscriptionData.isUserCancellable : true,
          invoiceIds: Array.isArray(subscriptionData.invoiceIds) ? subscriptionData.invoiceIds : [],
          paymentType: subscriptionData.paymentType || 'recurring'
        },
        { upsert: true }
      );
      
      count++;
    });
    
    await Promise.all(promises);
    console.log(`Successfully migrated ${count} subscriptions`);
    return count;
  } catch (error) {
    console.error('Error migrating subscriptions:', error);
    throw error;
  }
};

// Function to migrate businesses from Firestore to MongoDB
const migrateBusinesses = async () => {
  try {
    console.log('Starting migration of businesses...');
    const businessesSnapshot = await getDocs(collection(db, 'businesses'));
    
    if (businessesSnapshot.empty) {
      console.log('No businesses to migrate');
      return 0;
    }
    
    let count = 0;
    const promises = businessesSnapshot.docs.map(async (doc) => {
      const businessData = doc.data();
      
      // Create or update business in MongoDB
      await Business.findOneAndUpdate(
        { id: Number(doc.id) },
        {
          id: Number(doc.id),
          name: businessData.name || '',
          description: businessData.description || '',
          category: businessData.category || '',
          address: businessData.address || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
          website: businessData.website || '',
          rating: Number(businessData.rating || 0),
          reviews: Number(businessData.reviews || 0),
          latitude: Number(businessData.latitude || 0),
          longitude: Number(businessData.longitude || 0),
          hours: businessData.hours || {},
          tags: Array.isArray(businessData.tags) ? businessData.tags : [],
          featured: Boolean(businessData.featured),
          image: businessData.image || ''
        },
        { upsert: true }
      );
      
      count++;
    });
    
    await Promise.all(promises);
    console.log(`Successfully migrated ${count} businesses`);
    return count;
  } catch (error) {
    console.error('Error migrating businesses:', error);
    throw error;
  }
};

// Main migration function
export const migrateFirestoreToMongoDB = async () => {
  try {
    console.log('Starting Firestore to MongoDB migration...');
    
    // Ensure MongoDB connection
    await connectToMongoDB();
    
    // Run all migrations
    const userCount = await migrateUsers();
    const packageCount = await migrateSubscriptionPackages();
    const subscriptionCount = await migrateSubscriptions();
    const businessCount = await migrateBusinesses();
    
    console.log('----- Migration Summary -----');
    console.log(`Users: ${userCount}`);
    console.log(`Subscription Packages: ${packageCount}`);
    console.log(`Subscriptions: ${subscriptionCount}`);
    console.log(`Businesses: ${businessCount}`);
    console.log('-----------------------------');
    console.log('Migration completed successfully');
    
    return {
      success: true,
      userCount,
      packageCount,
      subscriptionCount,
      businessCount
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Optional: Create CLI command for migration
if (typeof window === 'undefined' && require.main === module) {
  migrateFirestoreToMongoDB()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}
