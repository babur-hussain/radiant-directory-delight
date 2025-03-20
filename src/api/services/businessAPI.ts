
import { api } from '../core/apiService';

// Direct API calls for businesses
export const fetchBusinesses = async () => {
  try {
    const response = await api.get('/businesses');
    return response.data;
  } catch (error) {
    console.log("Error fetching businesses:", error.message);
    throw error; // Rethrow to allow fallback mechanism to work
  }
};

export const saveBusiness = async (businessData: any) => {
  const response = await api.post('/businesses', businessData);
  return response.data;
};

export const deleteBusiness = async (businessId: string) => {
  await api.delete(`/businesses/${businessId}`);
};
