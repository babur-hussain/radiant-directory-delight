
import { 
  fetchSubscriptionPackages as apiFetchSubscriptionPackages,
  fetchSubscriptionPackagesByType as apiFetchSubscriptionPackagesByType,
  saveSubscriptionPackage as apiSaveSubscriptionPackage,
  deleteSubscriptionPackage as apiDeleteSubscriptionPackage,
  saveBusiness as apiSaveBusiness,
  deleteBusiness as apiDeleteBusiness,
  getAllUsers as apiFetchUsers,
  fetchUserByUid as apiFetchUserByUid,
  getUserSubscription as apiFetchUserSubscriptions,
  fetchBusinesses as apiFetchBusinesses
} from '../api/mongoAPI';
import { ISubscriptionPackage } from '../models/SubscriptionPackage';
import { IBusiness } from '../models/Business';
import { IUser } from '../models/User';
import { ISubscription } from '@/models/Subscription';
import { syncPackageToFirebase } from '@/utils/syncMongoFirebase';

/**
 * Fetches all subscription packages from MongoDB
 */
export const fetchSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    const packages = await apiFetchSubscriptionPackages();
    
    if (!packages || packages.length === 0) {
      console.warn("No subscription packages found in MongoDB");
      return [];
    }
    
    console.log("Fetched packages:", packages);
    
    // Make sure all one-time packages have valid price
    const validatedPackages = packages.map(pkg => {
      if (pkg.paymentType === "one-time" && (!pkg.price || pkg.price <= 0)) {
        return {
          ...pkg,
          price: 999 // Set default price for one-time packages if missing or 0
        };
      }
      return pkg;
    });
    
    return validatedPackages;
  } catch (error) {
    console.error("Error fetching subscription packages:", error);
    throw error;
  }
};

/**
 * Fetches subscription packages by type from MongoDB
 */
export const fetchSubscriptionPackagesByType = async (type: "Business" | "Influencer"): Promise<ISubscriptionPackage[]> => {
  try {
    console.log(`Fetching ${type} subscription packages from MongoDB API...`);
    const packages = await apiFetchSubscriptionPackagesByType(type);
    
    if (!packages || packages.length === 0) {
      console.warn(`No ${type} subscription packages found in MongoDB`);
      return [];
    }
    
    console.log(`Fetched ${packages.length} ${type} packages:`, packages);
    
    // Make sure all packages have valid and required fields
    const validatedPackages = packages.map(pkg => {
      // Create a new object with defaults for missing fields
      const validatedPkg = {
        ...pkg,
        id: pkg.id || `pkg_${Date.now()}`,
        title: pkg.title || 'Untitled Package',
        price: Number(pkg.price) || 999,
        durationMonths: Number(pkg.durationMonths) || 12,
        shortDescription: pkg.shortDescription || pkg.title || '',
        fullDescription: pkg.fullDescription || pkg.shortDescription || '',
        features: Array.isArray(pkg.features) ? pkg.features : [],
        popular: !!pkg.popular,
        type: pkg.type || type,
        paymentType: pkg.paymentType || "recurring"
      };
      
      // Special handling for one-time packages
      if (validatedPkg.paymentType === "one-time") {
        if (!validatedPkg.price || validatedPkg.price <= 0) {
          validatedPkg.price = 999; // Set default price for one-time packages if missing or 0
        }
        // One-time packages don't need these fields
        validatedPkg.billingCycle = undefined;
        validatedPkg.setupFee = 0;
      } else {
        // Set defaults for recurring packages
        validatedPkg.billingCycle = validatedPkg.billingCycle || "yearly";
        validatedPkg.setupFee = Number(validatedPkg.setupFee) || 0;
      }
      
      return validatedPkg;
    });
    
    return validatedPackages;
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
};

/**
 * Saves a subscription package to MongoDB and syncs to Firebase
 */
export const saveSubscriptionPackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  try {
    console.log("Original package data to save:", packageData);
    
    // Ensure price is properly set for one-time payment packages
    let sanitizedPackage = { ...packageData };
    
    if (packageData.paymentType === "one-time") {
      // Make sure one-time packages have required fields
      if (!packageData.price || packageData.price <= 0) {
        console.warn("One-time package has invalid price, setting default:", packageData.id);
        sanitizedPackage.price = 999; // Default to 999 if not set
      }
      
      // One-time packages don't need recurring fields
      sanitizedPackage.billingCycle = undefined;
      sanitizedPackage.setupFee = 0;
      sanitizedPackage.monthlyPrice = undefined;
      sanitizedPackage.advancePaymentMonths = 0;
    } else {
      // Make sure recurring packages have required fields
      if (!sanitizedPackage.billingCycle) {
        sanitizedPackage.billingCycle = "yearly";
      }
    }
    
    console.log("Sanitized package data to save:", sanitizedPackage);
    
    // Save to MongoDB via API
    const savedPackage = await apiSaveSubscriptionPackage(sanitizedPackage);
    
    // Sync the package to Firebase
    try {
      console.log("Syncing package to Firebase:", packageData.id);
      await syncPackageToFirebase(savedPackage);
      console.log("Successfully synced package to Firebase");
    } catch (syncError) {
      console.error("Error syncing package to Firebase:", syncError);
      // We don't throw here to avoid breaking the save operation
      // The package was saved to MongoDB successfully
    }
    
    return savedPackage;
  } catch (error) {
    console.error("Error saving subscription package:", error);
    throw error;
  }
};

/**
 * Deletes a subscription package from MongoDB
 */
export const deleteSubscriptionPackage = async (packageId: string): Promise<{ success: boolean }> => {
  try {
    await apiDeleteSubscriptionPackage(packageId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription package:", error);
    throw error;
  }
};

/**
 * Saves a business to MongoDB
 */
export async function saveBusiness(business: IBusiness): Promise<void> {
  try {
    console.log("Saving business to MongoDB:", business);
    
    // Validate required fields
    if (!business.name) {
      throw new Error("Business name is required");
    }
    
    // Format business data
    const formattedBusiness = {
      ...business,
      // Ensure numeric fields are stored as numbers
      rating: Number(business.rating),
      reviews: Number(business.reviews),
      latitude: Number(business.latitude || 0),
      longitude: Number(business.longitude || 0),
      // Ensure boolean fields are stored as booleans
      featured: Boolean(business.featured)
    };
    
    // Save to MongoDB via API
    await apiSaveBusiness(formattedBusiness);
    
    console.log("Business saved successfully with ID:", business.id);
  } catch (error) {
    console.error("Error saving business:", error);
    throw error;
  }
}

/**
 * Deletes a business from MongoDB
 */
export async function deleteBusiness(businessId: string): Promise<void> {
  try {
    console.log("Deleting business with ID:", businessId);
    await apiDeleteBusiness(businessId);
    console.log("Business deleted successfully");
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}

/**
 * Fetches all users from MongoDB
 */
export const fetchUsers = async (): Promise<IUser[]> => {
  try {
    const users = await apiFetchUsers();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Fetches user by UID from MongoDB
 */
export const fetchUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await apiFetchUserByUid(uid);
    return user;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    throw error;
  }
};

/**
 * Fetches user subscriptions from MongoDB
 */
export const fetchUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  try {
    const subscription = await apiFetchUserSubscriptions(userId);
    return subscription ? [subscription] : [];
  } catch (error) {
    console.error(`Error fetching subscriptions for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetches all businesses from MongoDB
 */
export const fetchBusinesses = async (): Promise<IBusiness[]> => {
  try {
    const businesses = await apiFetchBusinesses();
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
};

// Note: Additional utility functions will be added as needed
