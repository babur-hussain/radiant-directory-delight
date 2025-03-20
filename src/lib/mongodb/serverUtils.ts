
import { api } from '@/api/core/apiService';

/**
 * Checks if the MongoDB server is available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  console.log("Checking server availability...");
  
  try {
    // Use a longer timeout to avoid false negatives
    const response = await api.get('/test-connection', { 
      timeout: 8000,
      validateStatus: (status) => status >= 200 && status < 500 // Accept any non-server error response
    });
    
    // Log the response for debugging
    console.log("Server availability check response:", response);
    
    // If we got any response at all, consider the server available
    if (response) {
      console.log("Server is available, response:", response.data);
      return true;
    }
    
    return false;
  } catch (error) {
    if (error.response) {
      // If we got a response object, the server is available even if there's an error
      console.log("Server returned an error response, but is available:", error.response.status);
      return true;
    }
    
    // If it's a network error or timeout, server is not available
    console.error("Server not available:", error.message || "Unknown error");
    return false;
  }
}
