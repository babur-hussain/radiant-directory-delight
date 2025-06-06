
/**
 * CORS handling utilities for MongoDB API requests
 */

// Configuration for fetch API to handle CORS properly
export const corsConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors' as RequestMode
};

// Helper function to create headers without problematic cache-control
export const createSafeCorsHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Environment': 'production'
});

// Helper function for making API requests without CORS issues
export const makeCorsRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Always use these headers to avoid CORS problems
    const headers = {
      ...createSafeCorsHeaders(),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('CORS request failed:', error);
    throw error;
  }
};

// Server instructions to fix CORS (add to your documentation)
export const corsServerConfig = `
// Add these headers to your server.js to fix CORS issues:

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Environment, X-Direct-MongoDB');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
`;
