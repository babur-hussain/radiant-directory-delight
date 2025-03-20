
import { fetchUserByUid as apiFetchUserByUid } from '@/api';
import { IUser } from '@/models/User';
import { getUserFromLocalStorage, storeUserLocally, postToMongoDB } from '@/api/core/apiService';

// Helper function to convert from DB fields to our model
const mapDatabaseToModel = (dbUser: any): IUser => {
  return {
    uid: dbUser.id || dbUser.uid,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    isAdmin: dbUser.is_admin || false,
    photoURL: dbUser.photo_url,
    employeeCode: dbUser.employee_code,
    createdAt: new Date(dbUser.created_at || new Date()),
    lastLogin: new Date(dbUser.last_login || dbUser.created_at || new Date()),
    
    // Shared fields
    phone: dbUser.phone,
    instagramHandle: dbUser.instagram_handle,
    facebookHandle: dbUser.facebook_handle,
    verified: dbUser.verified,
    city: dbUser.city,
    country: dbUser.country,
    
    // Influencer fields
    niche: dbUser.niche,
    followersCount: dbUser.followers_count,
    bio: dbUser.bio,
    
    // Business fields
    businessName: dbUser.business_name,
    ownerName: dbUser.owner_name,
    businessCategory: dbUser.business_category,
    website: dbUser.website,
    address: dbUser.address,
    gstNumber: dbUser.gst_number
  };
};

/**
 * Fetches user by UID from MongoDB with local fallback
 */
export const fetchUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    // Try to fetch user from MongoDB API
    const user = await apiFetchUserByUid(uid);
    
    // If we got a user, update local storage for future offline access
    if (user) {
      const modelUser = mapDatabaseToModel(user);
      storeUserLocally(modelUser);
      return modelUser;
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
