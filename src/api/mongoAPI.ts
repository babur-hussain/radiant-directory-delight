
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    toast({
      title: 'API Error',
      description: error.response?.data?.message || error.message || 'Something went wrong',
      variant: 'destructive'
    });
    return Promise.reject(error);
  }
);

// Users API
export const fetchUserByUid = async (uid: string) => {
  try {
    const response = await api.get(`/users/${uid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createOrUpdateUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUserLoginTimestamp = async (uid: string) => {
  await api.put(`/users/${uid}/login`);
};

export const updateUserRole = async (uid: string, role: string, isAdmin: boolean = false) => {
  const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Business API
export const fetchBusinesses = async () => {
  const response = await api.get('/businesses');
  return response.data;
};

export const saveBusiness = async (businessData: any) => {
  const response = await api.post('/businesses', businessData);
  return response.data;
};

export const deleteBusiness = async (businessId: string) => {
  await api.delete(`/businesses/${businessId}`);
};

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
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const saveSubscription = async (subscriptionData: any) => {
  const response = await api.post('/subscriptions', subscriptionData);
  return response.data;
};

// MongoDB initialization
export const initializeMongoDB = async () => {
  const response = await api.post('/initialize-mongodb');
  return response.data;
};

export const testMongoDBConnection = async () => {
  const response = await api.get('/test-connection');
  return response.data;
};
