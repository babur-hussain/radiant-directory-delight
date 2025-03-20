
import { api } from '../core/apiService';

// Subscription Packages API
export const fetchSubscriptionPackages = async () => {
  try {
    const response = await api.get('/subscription-packages');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription packages:', error);
    throw error;
  }
};

export const fetchSubscriptionPackagesByType = async (type: string) => {
  try {
    const response = await api.get(`/subscription-packages/type/${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription packages by type:', error);
    throw error;
  }
};

export const saveSubscriptionPackage = async (packageData: any) => {
  try {
    console.log('API: Saving subscription package:', packageData);
    
    // Ensure we have an ID before saving
    if (!packageData.id) {
      packageData.id = `pkg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.log('Generated new package ID:', packageData.id);
    }
    
    // Use axios directly for better control over the response
    const response = await api.post('/subscription-packages', packageData);
    console.log('API: Save response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error saving subscription package:', error);
    
    // Check if we have a meaningful error response
    if (error.response && error.response.data) {
      console.error('API error details:', error.response.data);
    }
    
    throw error;
  }
};

export const deleteSubscriptionPackage = async (packageId: string) => {
  try {
    await api.delete(`/subscription-packages/${packageId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting subscription package:', error);
    throw error;
  }
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
