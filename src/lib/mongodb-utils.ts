import { connectToMongoDB } from '../config/mongodb';
import mongoose from '../config/mongodb';
import { SubscriptionPackage, ISubscriptionPackage } from '../models/SubscriptionPackage';
import { Business, IBusiness } from '../models/Business';
import { setupMongoDB } from '@/utils/setupMongoDB';

/**
 * Fetches all subscription packages from MongoDB
 */
export const fetchSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    // First ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Attempt to get the SubscriptionPackage model
    let packageModel;
    try {
      packageModel = mongoose.model('SubscriptionPackage');
    } catch (modelError) {
      console.error("Model not found, initializing MongoDB:", modelError);
      // If model not found, try to initialize MongoDB first
      await setupMongoDB();
      // Then try again
      packageModel = mongoose.model('SubscriptionPackage');
    }
    
    // Now fetch all packages
    const packages = await packageModel.find().lean();
    
    if (!packages || packages.length === 0) {
      console.warn("No subscription packages found in MongoDB");
    }
    
    return packages;
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
    // First ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get the SubscriptionPackage model
    let packageModel;
    try {
      packageModel = mongoose.model('SubscriptionPackage');
    } catch (modelError) {
      console.error("Model not found, initializing MongoDB:", modelError);
      // If model not found, try to initialize MongoDB first
      await setupMongoDB();
      // Then try again
      packageModel = mongoose.model('SubscriptionPackage');
    }
    
    // Query by type
    const packages = await packageModel.find({ type }).lean();
    
    if (!packages || packages.length === 0) {
      console.warn(`No ${type} subscription packages found in MongoDB`);
    }
    
    return packages;
  } catch (error) {
    console.error(`Error fetching ${type} subscription packages:`, error);
    throw error;
  }
};

/**
 * Saves a subscription package to MongoDB
 */
export const saveSubscriptionPackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  try {
    // First ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get the SubscriptionPackage model
    let packageModel;
    try {
      packageModel = mongoose.model('SubscriptionPackage');
    } catch (modelError) {
      console.error("Model not found, initializing MongoDB:", modelError);
      // If model not found, try to initialize MongoDB first
      await setupMongoDB();
      // Then try again
      packageModel = mongoose.model('SubscriptionPackage');
    }
    
    // Check if package with this ID already exists
    const existingPackage = await packageModel.findOne({ id: packageData.id });
    
    if (existingPackage) {
      // Update existing package
      const updated = await packageModel.findOneAndUpdate(
        { id: packageData.id },
        packageData,
        { new: true }
      );
      return updated;
    } else {
      // Create new package
      const newPackage = await packageModel.create(packageData);
      return newPackage;
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
    // First ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get the SubscriptionPackage model
    const packageModel = mongoose.model('SubscriptionPackage');
    
    // Delete the package
    const result = await packageModel.deleteOne({ id: packageId });
    
    if (result.deletedCount === 0) {
      throw new Error(`Package with ID ${packageId} not found`);
    }
    
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
    // Ensure MongoDB is initialized
    const connected = await connectToMongoDB();
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
    const connected = await connectToMongoDB();
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
