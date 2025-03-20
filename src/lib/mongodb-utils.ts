
// This file is now just a re-export of the refactored modules
// It's kept for backwards compatibility
import * as subscriptionUtils from './mongodb/subscriptionUtils';
import * as businessUtils from './mongodb/businessUtils';
import * as userUtils from './mongodb/userUtils';

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
    const response = await fetch('http://localhost:3001/api/health', { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};
