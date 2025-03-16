
import { User, IUser } from '../models/User';
import { SubscriptionPackage, ISubscriptionPackage } from '../models/SubscriptionPackage';
import { Business, IBusiness } from '../models/Business';
import { Subscription, ISubscription } from '../models/Subscription';
import { autoInitMongoDB } from '../utils/setupMongoDB';

// Ensure MongoDB is initialized before any operations
const ensureMongoDBInitialized = async () => {
  try {
    await autoInitMongoDB();
  } catch (error) {
    console.error("Error initializing MongoDB:", error);
    throw error;
  }
};

/**
 * Fetches all subscription packages from MongoDB
 */
export async function fetchSubscriptionPackages(): Promise<ISubscriptionPackage[]> {
  try {
    // Ensure MongoDB is initialized
    await ensureMongoDBInitialized();
    
    console.log("Fetching subscription packages from MongoDB");
    
    // Query all packages and sort by price
    const packages = await SubscriptionPackage.find().sort({ price: 1 });
    
    console.log(`Retrieved ${packages.length} subscription packages`);
    
    // If no packages found, this could be a permission issue or just no data
    if (packages.length === 0) {
      console.warn("No subscription packages found. This could be due to missing data.");
    }
    
    return packages;
  } catch (error) {
    console.error("Error fetching subscription packages:", error);
    throw error;
  }
}

/**
 * Fetches all businesses from MongoDB
 */
export async function fetchBusinesses(): Promise<IBusiness[]> {
  try {
    // Ensure MongoDB is initialized
    await ensureMongoDBInitialized();
    
    console.log("Fetching businesses from MongoDB");
    
    // Query all businesses and sort by name
    const businesses = await Business.find().sort({ name: 1 });
    
    console.log(`Retrieved ${businesses.length} businesses from MongoDB`);
    
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses from MongoDB:", error);
    throw error;
  }
}

/**
 * Creates or updates a subscription package in MongoDB
 */
export async function saveSubscriptionPackage(packageData: ISubscriptionPackage): Promise<void> {
  try {
    // Ensure MongoDB is initialized
    await ensureMongoDBInitialized();
    
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
    await ensureMongoDBInitialized();
    
    console.log("Deleting subscription package with ID:", packageId);
    await SubscriptionPackage.deleteOne({ id: packageId });
    console.log("Subscription package deleted successfully");
  } catch (error) {
    console.error("Error deleting subscription package:", error);
    throw error;
  }
}

/**
 * Fetches subscription packages by type (Business or Influencer)
 */
export async function fetchSubscriptionPackagesByType(type: "Business" | "Influencer"): Promise<ISubscriptionPackage[]> {
  try {
    // Ensure MongoDB is initialized
    await ensureMongoDBInitialized();
    
    console.log(`Fetching ${type} subscription packages`);
    
    // Query packages by type and sort by price
    const packages = await SubscriptionPackage.find({ type }).sort({ price: 1 });
    
    console.log(`Retrieved ${packages.length} ${type} packages`);
    
    return packages;
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
}

/**
 * Saves a business to MongoDB
 */
export async function saveBusiness(business: IBusiness): Promise<void> {
  try {
    // Ensure MongoDB is initialized
    await ensureMongoDBInitialized();
    
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
    await ensureMongoDBInitialized();
    
    console.log("Deleting business with ID:", businessId);
    await Business.deleteOne({ id: businessId });
    console.log("Business deleted successfully");
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}
