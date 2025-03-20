import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { getLocalFallbackPackages } from '@/lib/mongodb/serverUtils';

// API base URL - use production URL directly
export const API_BASE_URL = 'https://gbv-backend.onrender.com/api';

// Create axios instance with production configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // 8 second timeout for regular API calls
  headers: {
    'Content-Type': 'application/json',
    'X-Environment': 'production' // Add production marker
  }
});

// Add interceptors for error handling with better logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle all API errors with consistent messaging
    const errorMessage = error.response?.data?.message || error.message || 'API connection error';
    console.error('Production API Error:', error);
    
    if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
      console.warn('API connection timed out - falling back to local data');
      
      // Don't show toast for timeout errors, just fallback silently
      // Store error information in localStorage to help with debugging
      try {
        const existingErrors = JSON.parse(localStorage.getItem('api_errors') || '[]');
        existingErrors.push({
          timestamp: new Date().toISOString(),
          url: error.config?.url,
          method: error.config?.method,
          error: errorMessage
        });
        localStorage.setItem('api_errors', JSON.stringify(existingErrors.slice(-20))); // Keep last 20 errors
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      toast({
        title: 'Authentication Error',
        description: 'Your session may have expired. Please log in again.',
        variant: 'destructive'
      });
    } else if (!error.message.includes('Network Error') && !error.message.includes('timeout')) {
      // Only show toast for non-timeout, non-network errors
      toast({
        title: 'API Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
    
    return Promise.reject(error);
  }
);

// Check if the production server is running with shorter timeout
export const isServerRunning = async () => {
  try {
    console.log(`Checking if production server is running at ${API_BASE_URL}`);
    // Use a separate axios instance with a much shorter timeout
    const response = await axios.get(`${API_BASE_URL}/test-connection`, {
      timeout: 5000 // 5 seconds timeout for connectivity check
    });
    console.log('Production server is available:', response.data);
    return true;
  } catch (error) {
    console.error('Production server is not available:', error.message);
    return false;
  }
};

// Helper function to make API calls with fallback
export const apiCallWithFallback = async (apiCall, fallbackData) => {
  try {
    // First check if server is running
    const serverAvailable = await isServerRunning();
    if (!serverAvailable) {
      console.log('Server unavailable, using fallback data immediately');
      return fallbackData;
    }
    
    // If server is available, try the API call
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using fallback data:', error.message);
    return fallbackData;
  }
};

// Create a persistent local storage function for user data
export const storeUserLocally = (userData) => {
  if (!userData || !userData.uid) return;
  
  try {
    // Get existing users from local storage
    const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    
    // Find if user already exists
    const existingUserIndex = localUsers.findIndex(user => user.uid === userData.uid);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      localUsers[existingUserIndex] = {
        ...localUsers[existingUserIndex],
        ...userData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new user
      localUsers.push({
        ...userData,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Save to local storage
    localStorage.setItem('local_users', JSON.stringify(localUsers));
    
    // Also keep in sessionStorage for quicker access during the session
    sessionStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Error storing user locally:', error);
    return userData;
  }
};

// Get user from local storage
export const getUserFromLocalStorage = (uid) => {
  if (!uid) return null;
  
  try {
    // Try session storage first (faster)
    const sessionUser = sessionStorage.getItem(`user_${uid}`);
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }
    
    // Fall back to local storage
    const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    return localUsers.find(user => user.uid === uid) || null;
  } catch (error) {
    console.error('Error getting user from local storage:', error);
    return null;
  }
};
