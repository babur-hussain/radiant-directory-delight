
import { ISubscriptionPackage, SubscriptionPackage } from '@/models/SubscriptionPackage';
import { ISubscription } from '@/models/Subscription';
import { getSubscription, getSubscriptions, getUserSubscriptions, getActiveUserSubscription } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets a user's subscription packages from Supabase
 */
export const getSubscriptionPackages = async (): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*');
    
    if (error) throw error;
    return data as ISubscriptionPackage[];
  } catch (error) {
    console.error("Error getting subscription packages:", error);
    return [];
  }
}

/**
 * Gets subscription packages by type (Business, Influencer)
 */
export const getPackagesByType = async (type: string): Promise<ISubscriptionPackage[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('type', type);
    
    if (error) throw error;
    return data as ISubscriptionPackage[];
  } catch (error) {
    console.error(`Error getting ${type} packages:`, error);
    return [];
  }
}

/**
 * Creates or updates a subscription package
 */
export const createOrUpdatePackage = async (packageData: ISubscriptionPackage): Promise<ISubscriptionPackage | null> => {
  try {
    const { data, error } = await supabase
      .from('subscription_packages')
      .upsert(packageData)
      .select();
    
    if (error) throw error;
    return data?.[0] as ISubscriptionPackage || null;
  } catch (error) {
    console.error("Error creating/updating package:", error);
    return null;
  }
}

/**
 * Deletes a subscription package
 */
export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting package:", error);
    return false;
  }
}

/**
 * Gets a user's subscription from Supabase
 */
export const getUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  try {
    return await getActiveUserSubscription(userId);
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return null;
  }
}
