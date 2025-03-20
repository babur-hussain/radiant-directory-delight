
/**
 * Utility to check if the MongoDB server is running and available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking server availability...');
    
    // Try to fetch the API test connection endpoint instead of health-check
    const response = await fetch('/api/test-connection', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Add a reasonable timeout to prevent waiting too long
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server check response:', data);
      return data.success === true;
    }
    
    console.warn('Server connection check failed with status:', response.status);
    return false;
  } catch (error) {
    console.error('Server availability check error:', error);
    return false;
  }
};
