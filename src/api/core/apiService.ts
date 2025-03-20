
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { getLocalFallbackPackages } from '@/lib/mongodb/serverUtils';

// API base URL - use production URL directly
export const API_BASE_URL = 'https://gbv-backend.onrender.com/api';

// Create axios instance with production configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // Reduced timeout to avoid long waiting times
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
    const response = await axios.get(`${API_BASE_URL}/test-connection`, {
      timeout: 3000 // Much shorter timeout just for connectivity check
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
