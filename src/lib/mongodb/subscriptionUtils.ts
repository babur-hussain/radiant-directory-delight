
import { 
  getAllSubscriptionPackages, 
  getSubscriptionPackagesByType,
  createOrUpdateSubscriptionPackage, 
  deleteSubscriptionPackage as serviceDeleteSubscriptionPackage
} from '@/services/subscriptionService';
import { saveSubscriptionPackage as apiSaveSubscriptionPackage } from '@/api/services/subscriptionAPI';
import { getUserSubscription as apiFetchUserSubscriptions } from '@/api/services/subscriptionAPI';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { ISubscription } from '@/models/Subscription';
import { checkServerAvailability } from '@/lib/mongodb/serverUtils';
import { api } from '@/api/core/apiService';

/**
 * Fetches all subscription packages from MongoDB
 */
export const fetchSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    console.log("Fetching all subscription packages from MongoDB...");
    const packages = await getAllSubscriptionPackages();
    
    if (!packages || packages.length === 0) {
      console.warn("No subscription packages found in MongoDB");
      return [];
    }
    
    console.log("Fetched packages:", packages);
    
    // Make sure all one-time packages have valid price
    const validatedPackages = packages.map(pkg => {
      if (!pkg) return null;
      
      if (pkg.paymentType === "one-time" && (!pkg.price || pkg.price <= 0)) {
        return {
          ...pkg,
          price: 999 // Set default price for one-time packages if missing or 0
        };
      }
      return pkg;
    }).filter(pkg => pkg !== null) as ISubscriptionPackage[];
    
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
    console.log(`Fetching ${type} subscription packages from MongoDB...`);
    const packages = await getSubscriptionPackagesByType(type);
    
    if (!packages || packages.length === 0) {
      console.warn(`No ${type} subscription packages found in MongoDB`);
      return [];
    }
    
    console.log(`Fetched ${packages.length} ${type} packages:`, packages);
    
    // Make sure all packages have valid and required fields
    const validatedPackages = packages
      .filter(pkg => pkg !== null) // Filter out any null packages
      .map(pkg => {
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
 * Saves a subscription package to MongoDB
 */
export const saveSubscriptionPackage = async (packageData: any): Promise<ISubscriptionPackage> => {
  try {
    if (!packageData) {
      throw new Error("No package data provided");
    }
    
    console.log("Original package data to save:", packageData);
    
    // Ensure price is properly set for one-time payment packages
    let sanitizedPackage = { ...packageData };
    
    // Validate required fields
    if (!sanitizedPackage.title) {
      sanitizedPackage.title = "Untitled Package";
    }
    
    if (!sanitizedPackage.type) {
      throw new Error("Package type is required");
    }
    
    if (!sanitizedPackage.shortDescription) {
      sanitizedPackage.shortDescription = sanitizedPackage.title;
    }
    
    if (!sanitizedPackage.fullDescription) {
      sanitizedPackage.fullDescription = sanitizedPackage.shortDescription;
    }
    
    // Make sure setupFee is set if undefined
    if (sanitizedPackage.setupFee === undefined) {
      sanitizedPackage.setupFee = 0;
    }
    
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
      
      // Set a default price if not provided
      if (!sanitizedPackage.price || sanitizedPackage.price <= 0) {
        sanitizedPackage.price = 999;
      }
    }
    
    // Set a unique ID if not already set
    if (!sanitizedPackage.id) {
      sanitizedPackage.id = `pkg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    
    console.log("Sanitized package data to save:", sanitizedPackage);
    
    // Try to save via the API
    try {
      console.log("Attempting to save package via subscription API");
      const apiResponse = await apiSaveSubscriptionPackage(sanitizedPackage);
      console.log("API save response:", apiResponse);
      return apiResponse;
    } catch (apiError) {
      console.error("API save failed, falling back to direct service:", apiError);
      
      // Fall back to direct service call
      console.log("Attempting to save package via direct service call");
      const savedPackage = await createOrUpdateSubscriptionPackage(sanitizedPackage);
      
      if (!savedPackage) {
        console.warn("createOrUpdateSubscriptionPackage returned null, using sanitized package");
        return sanitizedPackage as ISubscriptionPackage;
      }
      
      console.log("Successfully saved package to MongoDB:", savedPackage);
      return savedPackage;
    }
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
    await serviceDeleteSubscriptionPackage(packageId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription package:", error);
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
 * Helper function to check server availability
 */
export const isServerRunning = async (): Promise<boolean> => {
  try {
    return await checkServerAvailability();
  } catch (error) {
    console.error("Error checking server availability:", error);
    return false;
  }
};
