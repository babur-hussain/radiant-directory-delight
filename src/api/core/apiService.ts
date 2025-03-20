
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL - use production URL directly
export const API_BASE_URL = 'https://gbv-backend.onrender.com/api';

// Create axios instance with production configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Extended timeout for reliable production connections
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
    console.error('Production API Error:', errorMessage, error);
    
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

// Check if the production server is running
export const isServerRunning = async () => {
  try {
    console.log(`Checking if production server is running at ${API_BASE_URL}`);
    const response = await api.get('/test-connection');
    console.log('Production server is available:', response.data);
    return true;
  } catch (error) {
    console.error('Production server is not available:', error.message);
    return false;
  }
};
