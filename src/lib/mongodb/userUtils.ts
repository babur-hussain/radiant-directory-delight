
import { fetchUserByUid as apiFetchUserByUid } from '@/api';
import { IUser } from '@/models/User';
import { getUserFromLocalStorage, storeUserLocally, postToMongoDB } from '@/api/core/apiService';

/**
 * Fetches user by UID from MongoDB with local fallback
 */
export const fetchUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    // Try to fetch user from MongoDB API
    const user = await apiFetchUserByUid(uid);
    
    // If we got a user, update local storage for future offline access
    if (user) {
      storeUserLocally(user);
      return user;
    }
    
    // If API returns null, try local storage
    console.error(`User with UID ${uid} not found in MongoDB API`);
    
    // Try local storage as fallback
    const localUser = getUserFromLocalStorage(uid);
    if (localUser) {
      console.log(`Using locally stored data for user ${uid}`);
      return localUser as IUser;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    
    // Try local storage as fallback
    const localUser = getUserFromLocalStorage(uid);
    if (localUser) {
      console.log(`Using locally stored data for user ${uid} after API error`);
      return localUser as IUser;
    }
    
    return null;
  }
};

/**
 * Updates a user's data in both API and local storage
 * Plus tries a direct MongoDB insert as backup
 */
export const updateUserData = async (userData: Partial<IUser> & { uid: string }): Promise<IUser | null> => {
  try {
    // First update local storage for immediate use
    const currentUser = getUserFromLocalStorage(userData.uid) as IUser;
    
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...userData,
        updatedAt: new Date()
      };
      
      // Store locally for offline resilience
      storeUserLocally(updatedUser);
      
      // Try to update in the API in the background
      fetch(`https://gbv-backend.onrender.com/api/users/${userData.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser)
      })
        .then(response => {
          if (response.ok) {
            console.log(`User ${userData.uid} updated successfully in MongoDB`);
          } else {
            console.warn(`Failed to update user ${userData.uid} in MongoDB, trying direct insert...`);
            
            // Try direct insert as a backup
            postToMongoDB('/direct-insert', {
              collection: 'user',
              document: {
                ...updatedUser,
                _id: userData.uid // Use uid as MongoDB _id
              }
            }).then(result => {
              if (result && result.success) {
                console.log(`User ${userData.uid} inserted directly into MongoDB`);
              } else {
                console.warn(`Failed to directly insert user ${userData.uid}`);
              }
            });
          }
        })
        .catch(error => {
          console.error(`API error updating user ${userData.uid}:`, error);
          
          // Try direct insert as a backup
          postToMongoDB('/direct-insert', {
            collection: 'user',
            document: {
              ...updatedUser,
              _id: userData.uid // Use uid as MongoDB _id
            }
          }).then(result => {
            if (result && result.success) {
              console.log(`User ${userData.uid} inserted directly into MongoDB after API error`);
            }
          });
        });
      
      return updatedUser;
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating user data for ${userData.uid}:`, error);
    return null;
  }
};

// Helper function to directly insert a user into MongoDB
export const directInsertUser = async (userData: IUser): Promise<boolean> => {
  try {
    const result = await postToMongoDB('/direct-insert', {
      collection: 'user',
      document: {
        ...userData,
        _id: userData.uid // Use uid as MongoDB _id
      }
    });
    
    return result && result.success;
  } catch (error) {
    console.error('Direct user insert failed:', error);
    return false;
  }
};
