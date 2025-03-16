
import { ISubscription, Subscription } from '../models/Subscription';
import mongoose from '../config/mongodb';
import { nanoid } from 'nanoid';

// Create a new subscription
export const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>): Promise<ISubscription> => {
  try {
    const subscription = new Subscription({
      ...subscriptionData,
      id: subscriptionData.id || nanoid()
    });
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get a subscription by ID
export const getSubscription = async (id: string): Promise<ISubscription> => {
  try {
    const subscription = await Subscription.findOne({ id });
    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    return subscription;
  } catch (error) {
    console.error(`Error getting subscription with ID ${id}:`, error);
    throw error;
  }
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    return subscriptions;
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    throw error;
  }
};

// Update a subscription
export const updateSubscription = async (id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription> => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { id },
      { $set: subscriptionData },
      { new: true }
    );
    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    return subscription;
  } catch (error) {
    console.error(`Error updating subscription with ID ${id}:`, error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    const result = await Subscription.findOneAndDelete({ id });
    if (!result) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Error deleting subscription with ID ${id}:`, error);
    throw error;
  }
};

// Get subscriptions for a specific user
export const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  try {
    const subscriptions = await Subscription.find({ userId }).sort({ startDate: -1 });
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
