
import { ISubscription, Subscription } from '../models/Subscription';
import mongoose from '../config/mongodb';
import { nanoid } from 'nanoid';
import { autoInitMongoDB } from '../utils/setupMongoDB';

// Auto-initialize MongoDB when this module is imported
autoInitMongoDB()
  .then(() => console.log('MongoDB initialized from subscription service'))
  .catch(err => console.error('Failed to initialize MongoDB from subscription service:', err));

// Create a new subscription
export const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>): Promise<ISubscription> => {
  try {
    // Generate a unique ID if not provided
    const subscriptionId = subscriptionData.id || nanoid();
    
    const subscription = new Subscription({
      ...subscriptionData,
      id: subscriptionId
    });
    
    await subscription.save();
    console.log(`Created subscription with ID: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get a subscription by ID
export const getSubscription = async (id: string): Promise<ISubscription> => {
  try {
    console.log(`Looking for subscription with ID: ${id}`);
    const subscription = await Subscription.findOne({ id });
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found`);
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    console.log(`Found subscription: ${id}`);
    return subscription;
  } catch (error) {
    console.error(`Error getting subscription with ID ${id}:`, error);
    throw error;
  }
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  try {
    console.log('Fetching all subscriptions');
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
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
    
    const subscription = await Subscription.findOneAndUpdate(
      { id },
      { $set: subscriptionData },
      { new: true }
    );
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found for update`);
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    console.log(`Updated subscription: ${id}`);
    return subscription;
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting subscription with ID: ${id}`);
    
    const result = await Subscription.findOneAndDelete({ id });
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
    
    const subscriptions = await Subscription.find({ userId }).sort({ startDate: -1 });
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
    
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'active' 
    });
    
    console.log(`Found subscription:`, subscription);
    return subscription;
  } catch (error) {
    console.error(`Error getting active subscription for user ${userId}:`, error);
    throw error;
  }
};
