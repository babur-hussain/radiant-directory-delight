
import { fetchUserByUid as apiFetchUserByUid } from '@/api';
import { IUser } from '@/models/User';
import { getUserFromLocalStorage } from '@/api/core/apiService';

/**
 * Fetches user by UID from MongoDB with local fallback
 */
export const fetchUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await apiFetchUserByUid(uid);
    return user;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    
    // Try local storage as fallback
    const localUser = getUserFromLocalStorage(uid);
    if (localUser) {
      console.log(`Using locally stored data for user ${uid}`);
      return localUser as IUser;
    }
    
    return null;
  }
};
