
import { db } from '@/config/firebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { SubscriptionPackage, ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { connectToMongoDB } from '@/config/mongodb';
import { toast } from '@/hooks/use-toast';

/**
 * Synchronizes a subscription package from MongoDB to Firebase
 */
export const syncPackageToFirebase = async (packageData: ISubscriptionPackage): Promise<boolean> => {
  try {
    console.log(`Syncing package ${packageData.id} to Firebase`);
    
    // Validate package data
    if (!packageData.id) {
      console.error('Cannot sync package: Missing ID');
      return false;
    }
    
    // Create clean package data for Firebase (remove MongoDB-specific fields)
    const cleanPackage = {
      ...packageData,
      price: Number(packageData.price || 0),
      monthlyPrice: packageData.monthlyPrice ? Number(packageData.monthlyPrice) : null,
      setupFee: Number(packageData.setupFee || 0),
      durationMonths: Number(packageData.durationMonths || 12),
      popular: Boolean(packageData.popular),
      advancePaymentMonths: Number(packageData.advancePaymentMonths || 0),
      paymentType: packageData.paymentType || 'recurring'
    };
    
    // Remove MongoDB specific properties
    delete (cleanPackage as any)._id;
    delete (cleanPackage as any).__v;
    
    // Remove undefined billingCycle for one-time packages
    if (cleanPackage.paymentType === 'one-time') {
      delete cleanPackage.billingCycle;
      
      // Ensure price is set for one-time packages
      if (!cleanPackage.price || cleanPackage.price <= 0) {
        console.log('Setting default price for one-time package in Firebase sync:', cleanPackage.id);
        cleanPackage.price = 999;
      }
    }
    
    // Save to Firebase
    const packageRef = doc(db, 'subscriptionPackages', packageData.id);
    await setDoc(packageRef, cleanPackage);
    
    console.log(`Successfully synced package ${packageData.id} to Firebase`);
    return true;
  } catch (error) {
    console.error('Error syncing package to Firebase:', error);
    
    // Check for permission errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('permission-denied') || 
        errorMessage.includes('Permission denied') ||
        errorMessage.includes('insufficient permissions')) {
      console.error('Firebase permission denied. Please check Firebase security rules.');
      
      toast({
        title: 'Firebase Sync Failed',
        description: 'Permission denied. Check your Firebase security rules.',
        variant: 'destructive'
      });
    }
    
    return false;
  }
};

/**
 * Synchronizes all subscription packages from MongoDB to Firebase
 */
export const syncAllPackagesToFirebase = async (): Promise<{success: boolean, count: number}> => {
  try {
    console.log('Starting sync of all packages from MongoDB to Firebase');
    
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB');
      return { success: false, count: 0 };
    }
    
    // Get all packages from MongoDB
    const packages = await SubscriptionPackage.find().lean();
    console.log(`Found ${packages.length} packages in MongoDB to sync`);
    
    if (packages.length === 0) {
      return { success: true, count: 0 };
    }
    
    // Sync each package to Firebase
    let successCount = 0;
    for (const pkg of packages) {
      const success = await syncPackageToFirebase(pkg);
      if (success) successCount++;
    }
    
    console.log(`Successfully synced ${successCount} of ${packages.length} packages to Firebase`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error('Error syncing all packages to Firebase:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Synchronizes Firebase packages to MongoDB
 */
export const syncFirebasePackagesToMongo = async (): Promise<{success: boolean, count: number}> => {
  try {
    console.log('Starting sync of packages from Firebase to MongoDB');
    
    // Get all packages from Firebase
    const packagesSnapshot = await getDocs(collection(db, 'subscriptionPackages'));
    console.log(`Found ${packagesSnapshot.docs.length} packages in Firebase to sync`);
    
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB');
      return { success: false, count: 0 };
    }
    
    let successCount = 0;
    for (const doc of packagesSnapshot.docs) {
      try {
        const packageData = doc.data() as ISubscriptionPackage;
        packageData.id = doc.id; // Ensure ID is set
        
        // Save to MongoDB
        await SubscriptionPackage.findOneAndUpdate(
          { id: packageData.id },
          packageData,
          { upsert: true, new: true }
        );
        
        successCount++;
      } catch (pkgError) {
        console.error(`Error syncing package ${doc.id} to MongoDB:`, pkgError);
      }
    }
    
    console.log(`Successfully synced ${successCount} of ${packagesSnapshot.docs.length} packages to MongoDB`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error('Error syncing Firebase packages to MongoDB:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Full two-way synchronization of packages between MongoDB and Firebase
 */
export const fullSyncPackages = async (): Promise<{success: boolean, mongoToFirebase: number, firebaseToMongo: number}> => {
  try {
    // First sync MongoDB to Firebase
    const mongoToFirebase = await syncAllPackagesToFirebase();
    
    // Then sync Firebase to MongoDB
    const firebaseToMongo = await syncFirebasePackagesToMongo();
    
    return {
      success: mongoToFirebase.success && firebaseToMongo.success,
      mongoToFirebase: mongoToFirebase.count,
      firebaseToMongo: firebaseToMongo.count
    };
  } catch (error) {
    console.error('Error during full synchronization:', error);
    return { success: false, mongoToFirebase: 0, firebaseToMongo: 0 };
  }
};
