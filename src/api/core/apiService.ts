
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL - use production URL directly
export const API_BASE_URL = 'https://gbv-backend.onrender.com/api';

// Create axios instance with production configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for slow production server
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
    
    if (error.code === 'ECONNABORTED') {
      console.warn('API connection timed out - falling back to local data');
      // Only show toast for non-timeout errors to avoid spamming the user
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      toast({
        title: 'Authentication Error',
        description: 'Your session may have expired. Please log in again.',
        variant: 'destructive'
      });
    } else {
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
      timeout: 5000 // Much shorter timeout just for connectivity check
    });
    console.log('Production server is available:', response.data);
    return true;
  } catch (error) {
    console.error('Production server is not available:', error.message);
    return false;
  }
};
