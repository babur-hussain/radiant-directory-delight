
/**
 * Utility to check if the MongoDB server is running and available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking server availability...');
    
    // Try to fetch the API test connection endpoint
    const response = await fetch('/api/test-connection', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Add a reasonable timeout to prevent waiting too long
      signal: AbortSignal.timeout(5000)
    });
    
    // Check if the response is valid
    if (response.ok) {
      console.log('Server connection successful with status:', response.status);
      return true;
    } else {
      console.warn('Server connection check failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Server availability check error:', error);
    return false;
  }
};
