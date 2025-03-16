import { User, IUser } from '../models/User';
import { SubscriptionPackage, ISubscriptionPackage } from '../models/SubscriptionPackage';
import { Business, IBusiness } from '../models/Business';
import { Subscription, ISubscription } from '../models/Subscription';
import { connectToMongoDB } from '../config/mongodb';
import { businessPackages, influencerPackages } from '@/data/subscriptionData';

/**
 * Ensures MongoDB is connected before any operations
 */
const ensureMongoDBConnected = async (): Promise<boolean> => {
  try {
    console.log("Ensuring MongoDB is connected before operations");
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error("Failed to connect to MongoDB");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
};

/**
 * Fetches all subscription packages from MongoDB
 */
export async function fetchSubscriptionPackages(): Promise<ISubscriptionPackage[]> {
  try {
    // Ensure MongoDB is connected
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      console.warn("Using default packages due to MongoDB connection failure");
      return [...businessPackages, ...influencerPackages];
    }
    
    console.log("Fetching subscription packages from MongoDB");
    
    // Query all packages and sort by price
    const packages = await SubscriptionPackage.find().sort({ price: 1 });
    
    console.log(`Retrieved ${packages.length} subscription packages from MongoDB`);
    
    // If no packages found, use default packages
    if (packages.length === 0) {
      console.warn("No subscription packages found in MongoDB. Using default packages.");
      return [...businessPackages, ...influencerPackages];
    }
    
    return packages;
  } catch (error) {
    console.error("Error fetching subscription packages:", error);
    // Return default packages on error
    return [...businessPackages, ...influencerPackages];
  }
}

/**
 * Fetches subscription packages by type (Business or Influencer)
 */
export async function fetchSubscriptionPackagesByType(type: "Business" | "Influencer"): Promise<ISubscriptionPackage[]> {
  try {
    // Ensure MongoDB is connected
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      console.warn(`Using default ${type} packages due to MongoDB connection failure`);
      return type === "Business" ? businessPackages : influencerPackages;
    }
    
    console.log(`Fetching ${type} subscription packages from MongoDB`);
    
    // Query packages by type and sort by price
    const packages = await SubscriptionPackage.find({ type }).sort({ price: 1 });
    
    console.log(`Retrieved ${packages.length} ${type} packages from MongoDB`);
    
    // If no packages found, use default packages for the type
    if (packages.length === 0) {
      console.warn(`No ${type} subscription packages found in MongoDB. Using default ${type} packages.`);
      return type === "Business" ? businessPackages : influencerPackages;
    }
    
    return packages;
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    // Return default packages for the type on error
    return type === "Business" ? businessPackages : influencerPackages;
  }
}

/**
 * Creates or updates a subscription package in MongoDB
 */
export async function saveSubscriptionPackage(packageData: ISubscriptionPackage): Promise<void> {
  try {
    // Ensure MongoDB is connected
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }
    
    console.log("Saving subscription package to MongoDB:", packageData);
    
    // Validate required fields before saving
    if (!packageData.id) {
      throw new Error("Package ID is required");
    }
    
    if (!packageData.title) {
      throw new Error("Package title is required");
    }
    
    // Make sure we have proper type conversion for numeric fields
    const sanitizedPackage = {
      ...packageData,
      price: Number(packageData.price),
      monthlyPrice: Number(packageData.monthlyPrice || 0),
      setupFee: Number(packageData.setupFee || 0),
      durationMonths: Number(packageData.durationMonths || 12),
      advancePaymentMonths: Number(packageData.advancePaymentMonths || 0),
      popular: Boolean(packageData.popular),
      // Ensure paymentType is always set
      paymentType: packageData.paymentType || "recurring",
      // Ensure termsAndConditions is set
      termsAndConditions: packageData.termsAndConditions || "",
    };
    
    // Update or create the package in MongoDB
    console.log("Before MongoDB upsert operation with data:", JSON.stringify(sanitizedPackage, null, 2));
    
    await SubscriptionPackage.findOneAndUpdate(
      { id: packageData.id },
      sanitizedPackage,
      { upsert: true, new: true }
    );
    
    console.log("Subscription package saved successfully with ID:", packageData.id);
    
    // Verify the document was saved by attempting to read it back
    try {
      const savedPackage = await SubscriptionPackage.findOne({ id: packageData.id });
      console.log(`Successfully verified document was saved with ID: ${packageData.id}`);
    } catch (verifyError) {
      console.error("Failed to verify document was saved:", verifyError);
    }
  } catch (error) {
    console.error("Error saving subscription package:", error);
    console.error("Package data that failed:", JSON.stringify(packageData, null, 2));
    throw error;
  }
}

/**
 * Deletes a subscription package from MongoDB
 */
export async function deleteSubscriptionPackage(packageId: string): Promise<void> {
  try {
    // Ensure MongoDB is initialized
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }
    
    console.log("Deleting subscription package with ID:", packageId);
    await SubscriptionPackage.deleteOne({ id: packageId });
    console.log("Subscription package deleted successfully");
  } catch (error) {
    console.error("Error deleting subscription package:", error);
    throw error;
  }
}

/**
 * Saves a business to MongoDB
 */
export async function saveBusiness(business: IBusiness): Promise<void> {
  try {
    // Ensure MongoDB is initialized
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }
    
    console.log("Saving business to MongoDB:", business);
    
    // Validate required fields
    if (!business.name) {
      throw new Error("Business name is required");
    }
    
    // Update or create the business in MongoDB
    await Business.findOneAndUpdate(
      { id: business.id },
      {
        ...business,
        // Ensure numeric fields are stored as numbers
        rating: Number(business.rating),
        reviews: Number(business.reviews),
        latitude: Number(business.latitude || 0),
        longitude: Number(business.longitude || 0),
        // Ensure boolean fields are stored as booleans
        featured: Boolean(business.featured)
      },
      { upsert: true, new: true }
    );
    
    console.log("Business saved successfully with ID:", business.id);
  } catch (error) {
    console.error("Error saving business:", error);
    throw error;
  }
}

/**
 * Deletes a business from MongoDB
 */
export async function deleteBusiness(businessId: number): Promise<void> {
  try {
    // Ensure MongoDB is initialized
    const connected = await ensureMongoDBConnected();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }
    
    console.log("Deleting business with ID:", businessId);
    await Business.deleteOne({ id: businessId });
    console.log("Business deleted successfully");
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}
