import { api } from '../core/apiService';

const VERCEL_PAYU_API_URL = 'https://payu-vercel-api-grow-bharat-vyapaars-projects.vercel.app/api/payu-hash';

// Initiate PayU payment (returns all required params for frontend form submission)
export const initiatePayUPayment = async (paymentData) => {
  try {
    const response = await fetch(VERCEL_PAYU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle rate limiting specifically
      if (response.status === 429 || 
          errorText.toLowerCase().includes('too many requests') || 
          errorText.toLowerCase().includes('rate limit') ||
          errorText.toLowerCase().includes('rate exceeded')) {
        throw new Error('Too many requests. Please wait 60 seconds before trying again.');
      }
      
      // Handle other errors
      if (response.status >= 500) {
        throw new Error('Payment service temporarily unavailable. Please try again later.');
      }
      
      // Handle specific PayU errors
      if (errorText.toLowerCase().includes('invalid') || errorText.toLowerCase().includes('failed')) {
        throw new Error(`Payment initiation failed: ${errorText}`);
      }
      
      throw new Error(`Payment initiation failed: ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response
    if (!data || !data.payuBaseUrl) {
      throw new Error('Invalid response from payment service');
    }
    
    return data;
  } catch (error) {
    console.error('PayU API error:', error);
    
    // Re-throw with better error messages
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Payment service error occurred');
    }
  }
};

// Generate PayU hash (if needed separately)
export const generatePayUHash = async (params) => {
  try {
    const response = await api.post('/payu/generate-hash', params);
    return response.data.hash;
  } catch (error) {
    console.error('PayU hash generation error:', error);
    throw new Error('Failed to generate payment hash');
  }
}; 