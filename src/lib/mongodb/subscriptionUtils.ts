
// This file is a compatibility layer redirecting to Supabase
import * as subscriptionUtils from '../supabase/subscriptionUtils';

// Re-export all functions for backwards compatibility
export const {
  getSubscriptionPackages,
  getPackagesByType,
  createOrUpdatePackage,
  deletePackage,
  getUserSubscription
} = subscriptionUtils;
