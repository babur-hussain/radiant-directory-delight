
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL with environment fallback and more robust fallback mechanism
export const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL 
  : 'https://gbv-backend.onrender.com/api'; // Updated to use a deployed server instead of localhost

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout to fail faster when server is unreachable
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors and show toast for non-connection issues
    // For connection issues, we'll handle them gracefully in the calling code
    if (!error.message.includes('Network Error') && !error.message.includes('Connection refused') && 
        !error.message.includes('timeout') && error.code !== 'ECONNABORTED') {
      console.error('API Error:', error.response?.data || error.message);
      toast({
        title: 'API Error',
        description: error.response?.data?.message || error.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
    return Promise.reject(error);
  }
);

// Check if the server is running
export const isServerRunning = async () => {
  try {
    console.log(`Checking if server is running at ${API_BASE_URL}/test-connection`);
    const response = await axios.get(`${API_BASE_URL}/test-connection`, { 
      timeout: 3000 // Reduced timeout for faster fallback
    });
    console.log("Server status check response:", response.data);
    return true;
  } catch (error) {
    console.warn("Server is not available:", error.message);
    return false;
  }
};

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
  try {
    const response = await api.get('/businesses');
    return response.data;
  } catch (error) {
    console.log("Error fetching businesses:", error.message);
    throw error; // Rethrow to allow fallback mechanism to work
  }
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
  try {
    // Check if server is running first
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log("Server is not available, skipping MongoDB initialization");
      return {
        success: false,
        collections: [],
        error: "Server is not available"
      };
    }
    
    const response = await api.post('/initialize-mongodb');
    
    // Ensure we have a properly structured response even if the API returns an unexpected format
    const result = response.data;
    return {
      success: !!result.success,
      collections: result.collections || [],
      error: result.error || null
    };
  } catch (error) {
    console.error("Error initializing MongoDB:", error);
    // Return structured error response
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const testMongoDBConnection = async () => {
  try {
    // Check if server is running first
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log("Server is not available, skipping MongoDB test");
      return {
        success: false,
        message: "Server is not available"
      };
    }
    
    const response = await api.get('/test-connection');
    return {
      success: true,
      message: response.data.message || "Connection successful"
    };
  } catch (error) {
    console.error("Error testing MongoDB connection:", error);
    // Return structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
};
