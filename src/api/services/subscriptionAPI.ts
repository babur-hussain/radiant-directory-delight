
import { api } from '../core/apiService';

// Subscription Packages API
export const fetchSubscriptionPackages = async () => {
  const response = await api.get('/subscription-packages');
  return response.data;
};

export const fetchSubscriptionPackagesByType = async (type: string) => {
  const response = await api.get(`/subscription-packages/type/${type}`);
  return response.data;
};

export const saveSubscriptionPackage = async (packageData: any) => {
  const response = await api.post('/subscription-packages', packageData);
  return response.data;
};

export const deleteSubscriptionPackage = async (packageId: string) => {
  await api.delete(`/subscription-packages/${packageId}`);
  return { success: true };
};

// User Subscriptions API
export const getUserSubscription = async (userId: string) => {
  try {
    const response = await api.get(`/subscriptions/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const saveSubscription = async (subscriptionData: any) => {
  const response = await api.post('/subscriptions', subscriptionData);
  return response.data;
};
