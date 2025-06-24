import { api } from '../core/apiService';

const VERCEL_PAYU_API_URL = 'https://payu-vercel-api-grow-bharat-vyapaars-projects.vercel.app/api/payu-hash';

// Initiate PayU payment (returns all required params for frontend form submission)
export const initiatePayUPayment = async (paymentData) => {
  const response = await fetch(VERCEL_PAYU_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error('PayU payment initiation failed');
  return await response.json();
};

// Generate PayU hash (if needed separately)
export const generatePayUHash = async (params) => {
  const response = await api.post('/payu/generate-hash', params);
  return response.data.hash;
}; 