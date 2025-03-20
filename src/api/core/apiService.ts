
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL with environment fallback and more robust fallback mechanism
export const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL 
  ? process.env.NEXT_PUBLIC_API_BASE_URL 
  : 'https://gbv-backend.onrender.com/api';

// Alternative local development URL
export const LOCAL_API_URL = 'http://localhost:3001/api';

// Create axios instance with configurable timeout
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced to 5 seconds to avoid long wait times
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors and show toast for non-connection issues
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
  
  // Try multiple endpoints to improve reliability
  const endpoints = ['/test-connection', '/subscription-packages'];
  
  for (const url of urls) {
    for (const endpoint of endpoints) {
      try {
        console.log(`Checking if server is running at ${url}${endpoint}`);
        const response = await axios.get(`${url}${endpoint}`, { 
          timeout: 2000 // Very short timeout for faster fallback
        });
        console.log(`Server status check response for ${url}${endpoint}:`, response.data);
        
        // Update the baseURL if the working URL is different from the default
        if (url !== api.defaults.baseURL) {
          console.log(`Switching API base URL to ${url}`);
          api.defaults.baseURL = url;
        }
        
        return true;
      } catch (error) {
        console.warn(`Server endpoint ${url}${endpoint} is not available:`, error.message);
      }
    }
  }
  
  console.warn("All server options are unavailable.");
  return false;
};
