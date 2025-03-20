
/**
 * Utility to check if the MongoDB server is running and available
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health-check', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
