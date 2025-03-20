
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
    
    // Check if the response is valid before trying to parse JSON
    if (!response.ok) {
      console.warn('Server connection check failed with status:', response.status);
      return false;
    }
    
    // Safely try to parse the JSON response
    try {
      const contentType = response.headers.get('content-type');
      
      // Only try to parse as JSON if the content type is application/json
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Server check response:', data);
        return data.success === true;
      } else {
        console.warn('Server returned non-JSON response:', contentType);
        // Instead of failing, assume server is not available when response isn't JSON
        return false;
      }
    } catch (jsonError) {
      console.error('Failed to parse server response as JSON:', jsonError);
      return false;
    }
  } catch (error) {
    console.error('Server availability check error:', error);
    return false;
  }
};
