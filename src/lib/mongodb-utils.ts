
// This file is now just a re-export of the refactored modules
// It's kept for backwards compatibility
import * as subscriptionUtils from './mongodb/subscriptionUtils';
import * as businessUtils from './mongodb/businessUtils';
import * as userUtils from './mongodb/userUtils';

// Re-export all functions for backward compatibility
export const {
  fetchSubscriptionPackages,
  fetchSubscriptionPackagesByType,
  saveSubscriptionPackage,
  deleteSubscriptionPackage,
  fetchUserSubscriptions
} = subscriptionUtils;

export const {
  fetchBusinesses,
  saveBusiness
} = businessUtils;

export const {
  fetchUserByUid
} = userUtils;
