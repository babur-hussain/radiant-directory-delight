
import { connectToMongoDB } from '../config/mongodb';
import mongoose from '../config/mongodb';
import { SubscriptionPackage, ISubscriptionPackage } from '../models/SubscriptionPackage';
import { Business, IBusiness } from '../models/Business';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { Subscription, ISubscription } from '@/models/Subscription';
import { User, IUser } from '@/models/User';

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
    
    // Fix one-time payment price if it's not set correctly
    if (packageData.paymentType === "one-time" && (!packageData.price || packageData.price <= 0)) {
      packageData.price = packageData.price || 999; // Default to 999 if not set
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

/**
 * Fetches all users from MongoDB
 */
export const fetchUsers = async (): Promise<IUser[]> => {
  try {
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get users from MongoDB
    const users = await User.find().lean();
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
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get user from MongoDB
    const user = await User.findOne({ uid }).lean();
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
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get subscriptions from MongoDB
    const subscriptions = await Subscription.find({ userId }).lean();
    return subscriptions;
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
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Could not connect to MongoDB");
    }
    
    // Get businesses from MongoDB
    const businesses = await Business.find().lean();
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
};
