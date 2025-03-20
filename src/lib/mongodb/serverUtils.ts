
/**
 * Utility to check if the MongoDB server is running and available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking server availability...');
    
    // Try to fetch the API health check endpoint
    const response = await fetch('/api/health-check', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Add a reasonable timeout to prevent waiting too long
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log('Server is available');
      return true;
    }
    
    console.warn('Server health check failed with status:', response.status);
    return false;
  } catch (error) {
    console.error('Server availability check error:', error);
    return false;
  }
};
