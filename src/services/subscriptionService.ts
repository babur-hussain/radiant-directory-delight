
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { ISubscription } from '@/models/Subscription';

// Get a single subscription by ID
export const getSubscription = async (id: string): Promise<ISubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
  
  return data as ISubscription | null;
};

// Get all subscriptions
export const getSubscriptions = async (): Promise<ISubscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
  
  return data as ISubscription[];
};

// Create a new subscription
export const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>): Promise<ISubscription> => {
  // Generate ID if not provided
  const id = subscriptionData.id || nanoid();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({ ...subscriptionData, id })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
  
  // Update user's subscription info
  await supabase
    .from('users')
    .update({
      subscription_id: id,
      subscription_status: subscriptionData.status,
      subscription_package: subscriptionData.packageId
    })
    .eq('id', subscriptionData.userId);
  
  return data as ISubscription;
};

// Update an existing subscription
export const updateSubscription = async (id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(subscriptionData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  // Update user's subscription info if status changed
  if (subscriptionData.status && data.user_id) {
    await supabase
      .from('users')
      .update({
        subscription_status: subscriptionData.status
      })
      .eq('id', data.user_id);
  }
  
  return data as ISubscription;
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_subscriptions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Get user subscriptions
export const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
  
  return data as ISubscription[];
};

// Get active user subscription
export const getActiveUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error getting active user subscription:', error);
    throw error;
  }
  
  return data as ISubscription | null;
};
