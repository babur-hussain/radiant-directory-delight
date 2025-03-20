
import { ISubscription, Subscription } from '../models/Subscription';
import { mongoose } from '../config/mongodb';
import { nanoid } from 'nanoid';
import { autoInitMongoDB } from '../utils/setupMongoDB';
import { ISubscriptionPackage, SubscriptionPackage } from '../models/SubscriptionPackage';
import { extractQueryData } from '../utils/queryHelpers';

// Auto-initialize MongoDB when this module is imported
autoInitMongoDB()
  .then(() => console.log('MongoDB initialized from subscription service'))
  .catch(err => console.error('Failed to initialize MongoDB from subscription service:', err));

// Create a new subscription
export const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>): Promise<ISubscription> => {
  try {
    // Generate a unique ID
    const subscriptionId = nanoid();
    
    const subscriptionModel = mongoose.model('Subscription', {});
    
    // Create subscription using our model's create method
    const subscription = await subscriptionModel.create({
      ...subscriptionData,
      id: subscriptionId
    });
    
    console.log(`Created subscription with ID: ${subscriptionId}`);
    return subscription as ISubscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get a subscription by ID
export const getSubscription = async (id: string): Promise<ISubscription> => {
  try {
    console.log(`Looking for subscription with ID: ${id}`);
    const subscriptionModel = mongoose.model('Subscription', {});
    const subscription = await subscriptionModel.findOne({ id });
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found`);
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    console.log(`Found subscription: ${id}`);
    return subscription as ISubscription;
  } catch (error) {
    console.error(`Error getting subscription with ID ${id}:`, error);
    throw error;
  }
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  try {
    console.log('Fetching all subscriptions');
    const subscriptionModel = mongoose.model('Subscription', {});
    const subscriptionsQuery = subscriptionModel.find();
    
    // Extract results safely using our utility function
    const subscriptions = extractQueryData<ISubscription>(subscriptionsQuery);
    
    console.log(`Found ${subscriptions.length} subscriptions`);
    return subscriptions;
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    throw error;
  }
};

// Update a subscription
export const updateSubscription = async (id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription> => {
  try {
    console.log(`Updating subscription with ID: ${id}`);
    const subscriptionModel = mongoose.model('Subscription', {});
    
    const subscription = await subscriptionModel.findOneAndUpdate(
      { id },
      { $set: subscriptionData },
      { new: true }
    );
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found for update`);
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    console.log(`Updated subscription: ${id}`);
    return subscription as ISubscription;
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting subscription with ID: ${id}`);
    const subscriptionModel = mongoose.model('Subscription', {});
    
    const result = await subscriptionModel.findOneAndDelete({ id });
    if (!result) {
      console.error(`Subscription with ID ${id} not found for deletion`);
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    console.log(`Deleted subscription: ${id}`);
  } catch (error) {
    console.error(`Error deleting subscription with ID ${id}:`, error);
    throw error;
  }
};

// Get subscriptions for a specific user
export const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  try {
    console.log(`Fetching subscriptions for user: ${userId}`);
    const subscriptionModel = mongoose.model('Subscription', {});
    const subscriptionsQuery = subscriptionModel.find({ userId });
    
    // Extract results safely using our utility function
    const subscriptions = extractQueryData<ISubscription>(subscriptionsQuery);
    
    console.log(`Found ${subscriptions.length} subscriptions for user ${userId}`);
    return subscriptions;
  } catch (error) {
    console.error(`Error getting subscriptions for user ${userId}:`, error);
    throw error;
  }
};

// Get active subscription for a user
export const getActiveUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  try {
    console.log(`Looking for active subscription for user ${userId}`);
    const subscriptionModel = mongoose.model('Subscription', {});
    
    const subscription = await subscriptionModel.findOne({ 
      userId, 
      status: 'active' 
    });
    
    console.log(`Found subscription:`, subscription);
    return subscription as ISubscription | null;
  } catch (error) {
    console.error(`Error getting active subscription for user ${userId}:`, error);
    throw error;
  }
};

// Create or update a subscription package
export const createOrUpdateSubscriptionPackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage> => {
  try {
    console.log(`Creating/updating subscription package: ${packageData.id}`);
    const packageModel = mongoose.model('SubscriptionPackage', {});
    
    // Set updated timestamp
    packageData.updatedAt = new Date();
    
    // Find and update or create new
    const result = await packageModel.findOneAndUpdate(
      { id: packageData.id },
      { $set: packageData },
      { new: true, upsert: true }
    );
    
    console.log(`Successfully saved subscription package: ${packageData.id}`);
    return result as ISubscriptionPackage;
  } catch (error) {
    console.error(`Error creating/updating subscription package: ${packageData.id}`, error);
    throw error;
  }
};

// Get all subscription packages
export const getAllSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    console.log('Fetching all subscription packages');
    const packageModel = mongoose.model('SubscriptionPackage', {});
    const packagesQuery = packageModel.find();
    
    // Extract results safely using our utility function
    const packages = extractQueryData<ISubscriptionPackage>(packagesQuery);
    
    console.log(`Found ${packages.length} subscription packages`);
    return packages;
  } catch (error) {
    console.error('Error getting all subscription packages:', error);
    throw error;
  }
};

// Get subscription packages by type
export const getSubscriptionPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    console.log(`Fetching subscription packages of type: ${type}`);
    const packageModel = mongoose.model('SubscriptionPackage', {});
    const packagesQuery = packageModel.find({ type });
    
    // Extract results safely using our utility function
    const packages = extractQueryData<ISubscriptionPackage>(packagesQuery);
    
    console.log(`Found ${packages.length} ${type} subscription packages`);
    return packages;
  } catch (error) {
    console.error(`Error getting ${type} subscription packages:`, error);
    throw error;
  }
};

// Delete a subscription package
export const deleteSubscriptionPackage = async (packageId: string): Promise<void> => {
  try {
    console.log(`Deleting subscription package with ID: ${packageId}`);
    const packageModel = mongoose.model('SubscriptionPackage', {});
    
    const result = await packageModel.findOneAndDelete({ id: packageId });
    if (!result) {
      console.error(`Subscription package with ID ${packageId} not found for deletion`);
      throw new Error(`Subscription package with ID ${packageId} not found`);
    }
    
    console.log(`Deleted subscription package: ${packageId}`);
  } catch (error) {
    console.error(`Error deleting subscription package with ID ${packageId}:`, error);
    throw error;
  }
};
