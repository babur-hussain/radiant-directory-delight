
// This file is a compatibility layer for code that used to depend on MongoDB
import * as subscriptionUtils from './supabase/subscriptionUtils';
import * as businessUtils from './supabase/businessUtils';
import * as userUtils from './supabase/userUtils';
import { supabase } from '@/integrations/supabase/client';

// Re-export all functions for backward compatibility
export const {
  getSubscriptionPackages,
  getPackagesByType,
  createOrUpdatePackage,
  deletePackage,
  getUserSubscription
} = subscriptionUtils;

// Add compatibility exports for older code
export const fetchSubscriptionPackages = subscriptionUtils.getSubscriptionPackages;
export const fetchSubscriptionPackagesByType = subscriptionUtils.getPackagesByType;
export const saveSubscriptionPackage = subscriptionUtils.createOrUpdatePackage;
export const deleteSubscriptionPackage = subscriptionUtils.deletePackage;
export const fetchUserSubscriptions = subscriptionUtils.getUserSubscription;

export const {
  fetchBusinesses,
  saveBusiness
} = businessUtils;

export const {
  fetchUserByUid
} = userUtils;

// Add a utility function to check if the server is running
export const isServerRunning = async (): Promise<boolean> => {
  try {
    // With Supabase, we can just check if we can make a simple query
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};
