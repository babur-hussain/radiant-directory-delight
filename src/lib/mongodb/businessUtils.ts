
import { 
  fetchBusinesses as apiFetchBusinesses,
  saveBusiness as apiSaveBusiness
} from '@/api';
import { IBusiness } from '@/models/Business';

/**
 * Fetches businesses from MongoDB
 */
export const fetchBusinesses = async (): Promise<IBusiness[]> => {
  try {
    // Try the API first
    const businesses = await apiFetchBusinesses();
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    // Return empty array in case of error
    return [];
  }
};

/**
 * Saves a business to MongoDB
 */
export const saveBusiness = async (businessData: IBusiness): Promise<IBusiness> => {
  try {
    // Try the API first
    const business = await apiSaveBusiness(businessData);
    return business;
  } catch (error) {
    console.error("Error saving business:", error);
    // Return the original data in case of error
    return businessData;
  }
};
