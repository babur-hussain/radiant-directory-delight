
import { fetchUserByUid as apiFetchUserByUid } from '@/api';
import { IUser } from '@/models/User';

/**
 * Fetches user by UID from MongoDB
 */
export const fetchUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await apiFetchUserByUid(uid);
    return user;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    throw error;
  }
};
