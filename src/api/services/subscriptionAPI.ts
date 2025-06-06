import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Fetch all subscription packages
export const fetchSubscriptionPackages = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching subscription packages:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchSubscriptionPackages:', error);
    throw error;
  }
};

// Fetch subscription packages by type
export const fetchSubscriptionPackagesByType = async (type: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type)
      .order('price', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${type} subscription packages:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchSubscriptionPackagesByType(${type}):`, error);
    throw error;
  }
};

// Create or update subscription package
export const saveSubscriptionPackage = async (packageData: any) => {
  try {
    // Ensure package has an ID
    if (!packageData.id) {
      packageData.id = packageData.title.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Convert features to array if it's a string
    if (typeof packageData.features === 'string') {
      packageData.features = packageData.features.split(',').map((f: string) => f.trim());
    }
    
    const { data, error } = await supabase
      .from('subscription_packages')
      .upsert(packageData, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('Error saving subscription package:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in saveSubscriptionPackage:', error);
    // Rethrow with better error message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(JSON.stringify(error));
    }
  }
};

// Delete subscription package
export const deleteSubscriptionPackage = async (packageId: string) => {
  try {
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', packageId);
    
    if (error) {
      console.error('Error deleting subscription package:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteSubscriptionPackage:', error);
    throw error;
  }
};

// Get user subscriptions
export const getUserSubscriptions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSubscriptions:', error);
    throw error;
  }
};

// Get active user subscription
export const getActiveUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching active user subscription:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getActiveUserSubscription:', error);
    throw error;
  }
};

// Create user subscription
export const createSubscription = async (subscriptionData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select();
    
    if (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
    
    // Update user's subscription info
    await supabase
      .from('users')
      .update({
        subscription_id: subscriptionData.id,
        subscription_status: subscriptionData.status,
        subscription_package: subscriptionData.packageId
      })
      .eq('id', subscriptionData.userId);
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in createSubscription:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (subscriptionId: string, subscriptionData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('id', subscriptionId)
      .select();
    
    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
    
    // Update user's subscription info if status changed
    if (subscriptionData.status) {
      await supabase
        .from('users')
        .update({
          subscription_status: subscriptionData.status
        })
        .eq('id', subscriptionData.userId);
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string, reason?: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason || ''
      })
      .eq('id', subscriptionId)
      .select();
    
    if (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
    
    if (data?.[0]) {
      // Update user's subscription status
      await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('id', data[0].user_id);
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    throw error;
  }
};
