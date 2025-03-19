import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { connectToMongoDB } from '@/config/mongodb';
import { IUser } from '@/models/User';
import { UserRole } from '@/types/auth';

// API base URL with environment fallback and more robust fallback mechanism
export const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL 
  : 'https://gbv-backend.onrender.com/api'; // Updated to use a deployed server instead of localhost

// Alternative local development URL
export const LOCAL_API_URL = 'http://localhost:3001/api';

// Create axios instance with configurable timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // Increased timeout to handle slower connections
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
    if (!error.message.includes('Network Error') && 
        !error.message.includes('Connection refused') && 
        !error.message.includes('timeout') && 
        error.code !== 'ECONNABORTED') {
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

// Check if the server is running with a very short timeout
export const isServerRunning = async (useLocalFallback = false) => {
  const urls = useLocalFallback 
    ? [LOCAL_API_URL, API_BASE_URL] 
    : [API_BASE_URL, LOCAL_API_URL];
  
  for (const url of urls) {
    try {
      console.log(`Checking if server is running at ${url}/test-connection`);
      const response = await axios.get(`${url}/test-connection`, { 
        timeout: 1500 // Short timeout for faster fallback
      });
      console.log(`Server status check response for ${url}:`, response.data);
      
      // Update the baseURL if the working URL is different from the default
      if (url !== api.defaults.baseURL) {
        console.log(`Switching API base URL to ${url}`);
        api.defaults.baseURL = url;
      }
      
      return true;
    } catch (error) {
      console.warn(`Server at ${url} is not available:`, error.message);
    }
  }
  
  console.warn("All server options are unavailable. Using local fallback data.");
  return false;
};

export const fetchUserByUid = async (uid: string) => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();
    
    // Get data from localStorage (our mock MongoDB)
    const collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    const user = collection.find((u: any) => u.uid === uid);
    
    if (!user) {
      console.log(`User ${uid} not found in database`);
      return null;
    }

    console.log(`Found user in database:`, user);
    return user;
  } catch (error) {
    console.warn('Error fetching user from database:', error);
    return null;
  }
};

export const createOrUpdateUser = async (userData: any) => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Handle the case for default admin
    if (userData.email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }

    // Get current collection
    const collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    const index = collection.findIndex((u: any) => u.uid === userData.uid);

    if (index >= 0) {
      // Update existing user
      collection[index] = { ...collection[index], ...userData };
    } else {
      // Add new user
      collection.push(userData);
    }

    // Save back to localStorage (our mock MongoDB)
    localStorage.setItem('mongodb_User', JSON.stringify(collection));
    console.log(`User ${userData.uid} saved to database:`, userData);
    
    return userData;
  } catch (error) {
    console.warn('Error saving user to database:', error);
    return userData;
  }
};

// Update user's last login timestamp
export const updateUserLogin = async (uid: string): Promise<void> => {
  try {
    await updateUserLoginTimestamp(uid);
  } catch (error) {
    console.error('Error updating user login timestamp:', error);
  }
};

// API endpoint functions - used by the higher-level functions
export const updateUserLoginTimestamp = async (uid: string) => {
  try {
    await api.put(`/users/${uid}/login`);
  } catch (error) {
    console.warn('Error updating login timestamp:', error.message);
    // Non-critical operation, can continue without it
  }
};

// Direct API calls for user operations
export const apiUpdateUserRole = async (uid: string, role: string, isAdmin: boolean = false) => {
  const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
  return response.data;
};

export const apiGetAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Higher-level functions with error handling
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await apiGetAllUsers();
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Update user role - fixed to expect uid and role parameters
export const updateUserRole = async (uid: string, role: string): Promise<IUser | null> => {
  try {
    // Default isAdmin to false or derive it from role
    const isAdmin = role === 'Admin';
    const user = await apiUpdateUserRole(uid, role, isAdmin);
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

// Update user profile with all required fields
export const updateUserProfile = async (uid: string, profileData: Partial<IUser>): Promise<IUser | null> => {
  try {
    // Get existing user data
    const existingUser = await fetchUserByUid(uid);
    if (!existingUser) return null;
    
    // Merge existing data with new profile data
    const updatedUser = { 
      ...existingUser, 
      ...profileData,
      updatedAt: new Date() 
    };
    
    // Update the user
    const user = await createOrUpdateUser(updatedUser);
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Create a new user with full profile data for registration forms
export const createUserWithProfile = async (
  uid: string, 
  email: string, 
  role: UserRole, 
  profileData: any
): Promise<IUser | null> => {
  try {
    // Construct a complete user profile
    const userData = {
      uid,
      email,
      role,
      ...profileData,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Create the user
    const user = await createOrUpdateUser(userData);
    return user;
  } catch (error) {
    console.error('Error creating user with profile:', error);
    return null;
  }
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

// MongoDB initialization with better error handling
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

// Business API functions
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
