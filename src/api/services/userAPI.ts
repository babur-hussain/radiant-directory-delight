import { api, apiCallWithFallback, storeUserLocally, getUserFromLocalStorage } from '../core/apiService';
import { IUser } from '@/models/User';
import { UserRole } from '@/types/auth';

// In-memory user cache to improve performance and reduce API calls
const userCache = new Map();

// Maximum age for cache entries in milliseconds (5 minutes)
const CACHE_MAX_AGE = 5 * 60 * 1000;

// API-focused operations for users
export const fetchUserByUid = async (uid: string) => {
  try {
    // Check cache first
    if (userCache.has(uid)) {
      const cachedData = userCache.get(uid);
      const cacheAge = Date.now() - cachedData.timestamp;
      
      // Use cache if it's fresh
      if (cacheAge < CACHE_MAX_AGE) {
        console.log(`Returning cached user data for ${uid}`);
        return cachedData.data;
      } else {
        console.log(`Cached data for ${uid} is stale, refreshing...`);
      }
    }
    
    // Check local storage second (more persistent than cache)
    const localUser = getUserFromLocalStorage(uid);
    if (localUser) {
      console.log(`Returning locally stored user data for ${uid}`);
      
      // Update cache with timestamp
      userCache.set(uid, { 
        data: localUser, 
        timestamp: Date.now() 
      });
      
      // Try to refresh in the background without blocking
      refreshUserInBackground(uid);
      
      return localUser;
    }
    
    console.log(`Fetching user directly from API: ${uid}`);
    const response = await api.get(`/users/${uid}`);
    
    // Cache the user data with timestamp
    userCache.set(uid, { 
      data: response.data, 
      timestamp: Date.now() 
    });
    
    // Also store in local storage for persistence
    storeUserLocally(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user from API:', error);
    
    // Check local storage as last resort after API failure
    const localUser = getUserFromLocalStorage(uid);
    if (localUser) {
      console.log(`API failed, using locally stored user data for ${uid}`);
      
      // Update cache with fresh timestamp
      userCache.set(uid, { 
        data: localUser, 
        timestamp: Date.now() 
      });
      
      return localUser;
    }
    
    // Return null instead of throwing to allow graceful fallbacks
    return null;
  }
};

// Non-blocking background refresh of user data
const refreshUserInBackground = (uid: string) => {
  api.get(`/users/${uid}`)
    .then(response => {
      console.log(`Background refresh successful for user ${uid}`);
      userCache.set(uid, { 
        data: response.data, 
        timestamp: Date.now() 
      });
      storeUserLocally(response.data);
    })
    .catch(error => {
      console.warn(`Background refresh failed for user ${uid}:`, error.message);
    });
};

export const createOrUpdateUser = async (userData: any) => {
  try {
    console.log(`Creating/updating user via API: ${userData.uid} (${userData.email})`);
    
    // Handle the case for default admin
    if (userData.email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }
    
    // Properly handle uid matching
    const uid = userData.uid || userData.id;
    if (!uid) {
      console.error('User data missing uid/id field:', userData);
      return userData;
    }
    
    // Log the original role for verification
    const originalRole = userData.role;
    console.log(`Original role from userData: ${originalRole}`);
    
    // Format user data to ensure all required fields are present
    const formattedUserData = {
      ...userData,
      uid: uid,
      createdAt: userData.createdAt || new Date(),
      lastLogin: userData.lastLogin || new Date(),
      role: userData.role || 'User',
      isAdmin: userData.role === 'Admin' || userData.isAdmin || false
    };
    
    console.log(`Sending user data to API with role=${formattedUserData.role}`);
    
    // Always store in local memory cache and local storage regardless of API success
    userCache.set(uid, { 
      data: formattedUserData,
      timestamp: Date.now()
    });
    storeUserLocally(formattedUserData);
    
    try {
      // Try to get the user first with a shorter timeout
      const existingUser = await fetchUserByUid(uid);
      
      if (existingUser) {
        // Update existing user - ensure role is preserved
        const updatedData = {
          ...existingUser,
          ...formattedUserData,
          // Only update role if explicitly provided in userData
          role: userData.role || existingUser.role,
          updatedAt: new Date()
        };
        
        console.log(`Updating existing user via API with role=${updatedData.role}`);
        
        // Update local storage immediately to ensure data availability
        storeUserLocally(updatedData);
        
        // Make API call using a dedicated Promise to avoid blocking
        const updatePromise = api.put(`/users/${uid}`, updatedData)
          .then(response => {
            console.log('User updated via API successfully:', response.data);
            userCache.set(uid, { 
              data: response.data,
              timestamp: Date.now()
            });
            storeUserLocally(response.data);
            return response.data;
          })
          .catch(updateError => {
            console.error('API update failed, returning formatted data:', updateError);
            return updatedData;
          });
        
        // Return immediately with the cached data
        return updatedData;
      } else {
        // Create new user
        console.log(`Creating new user via API with role=${formattedUserData.role}`);
        
        // Store locally immediately
        storeUserLocally(formattedUserData);
        
        // Make API call using a dedicated Promise to avoid blocking
        const createPromise = api.post('/users', formattedUserData)
          .then(response => {
            console.log('New user created via API:', response.data);
            userCache.set(uid, { 
              data: response.data,
              timestamp: Date.now()
            });
            storeUserLocally(response.data);
            return response.data;
          })
          .catch(createError => {
            console.error('API create failed, returning formatted data:', createError);
            return formattedUserData;
          });
        
        // Return immediately with the formatted data
        return formattedUserData;
      }
    } catch (apiError) {
      console.error('API operation failed:', apiError);
      // Return the formatted data even if API fails
      return formattedUserData;
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return userData;
  }
};

// Direct API calls for user operations with memory caching
export const updateUserLoginTimestamp = async (uid: string) => {
  try {
    console.log(`Updating login timestamp via API for user: ${uid}`);
    
    // Update cache if we have this user
    if (userCache.has(uid)) {
      const userData = userCache.get(uid).data;
      userData.lastLogin = new Date();
      userCache.set(uid, { 
        data: userData,
        timestamp: Date.now()
      });
      storeUserLocally(userData); // Also update local storage
    }
    
    // Make non-blocking API call
    api.put(`/users/${uid}/login`)
      .then(response => {
        console.log(`Login timestamp updated via API for user ${uid}`);
      })
      .catch(error => {
        console.warn(`API login timestamp update failed for ${uid}, but local data updated`);
      });
    
    // Return success immediately after updating cache
    return { success: true, message: "User login timestamp updated" };
  } catch (error) {
    console.error('Error updating login timestamp:', error.message);
    // Don't throw, just log the error
    return { success: false, message: "Failed to update login timestamp" };
  }
};

export const apiUpdateUserRole = async (uid: string, role: string) => {
  try {
    const isAdmin = role === 'Admin';
    console.log(`Updating user role via API for user: ${uid}, role: ${role}, isAdmin: ${isAdmin}`);
    const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
    
    // Update cache if we have this user
    if (userCache.has(uid)) {
      const userData = userCache.get(uid).data;
      userData.role = role;
      userData.isAdmin = isAdmin;
      userCache.set(uid, { 
        data: userData,
        timestamp: Date.now()
      });
      storeUserLocally(userData);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in apiUpdateUserRole:', error);
    // Return null instead of throwing
    return null;
  }
};

export const apiGetAllUsers = async () => {
  try {
    console.log('Fetching all users from production API');
    const response = await api.get('/users');
    console.log(`Retrieved ${response.data.length} users from API`);
    
    // Update cache with fresh data
    response.data.forEach(user => {
      if (user.uid) {
        userCache.set(user.uid, { 
          data: user,
          timestamp: Date.now()
        });
        storeUserLocally(user);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting all users from API:', error);
    // Return empty array instead of throwing
    return [];
  }
};

// Higher-level functions with error handling
export const updateUserLogin = async (uid: string): Promise<void> => {
  try {
    await updateUserLoginTimestamp(uid);
  } catch (error) {
    console.error('Error updating user login timestamp:', error);
  }
};

export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    console.log('Getting all users from production API...');
    const users = await apiGetAllUsers();
    console.log(`Retrieved ${users.length} users from API`);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: string): Promise<IUser | null> => {
  try {
    const isAdmin = role === 'Admin';
    const user = await apiUpdateUserRole(uid, role);
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

// Update user profile with all required fields
export const updateUserProfile = async (uid: string, profileData: Partial<IUser>): Promise<IUser | null> => {
  try {
    // Get existing user data
    const existingUser = await fetchUserByUid(uid);
    if (!existingUser) return null;
    
    // Ensure we preserve the role from the existing user if not explicitly changed
    const role = profileData.role || existingUser.role;
    console.log(`Updating user profile with role=${role}`);
    
    // Merge existing data with new profile data
    const updatedUser = { 
      ...existingUser, 
      ...profileData,
      // Explicitly set role based on provided data or existing data
      role: role,
      updatedAt: new Date() 
    };
    
    // Update the user directly via API
    const user = await createOrUpdateUser(updatedUser);
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Create a new user with full profile data for registration forms
export const createUserWithProfile = async (
  uid: string, 
  email: string, 
  role: UserRole, 
  profileData: any
): Promise<IUser | null> => {
  try {
    // Log role for validation
    console.log(`Creating user with profile, role=${role}`);
    
    // Construct a complete user profile
    const userData = {
      uid,
      email,
      role,
      isAdmin: role === 'Admin',
      ...profileData,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Special case for default admin user
    if (email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }
    
    // Create the user directly via API
    const user = await createOrUpdateUser(userData);
    return user;
  } catch (error) {
    console.error('Error creating user with profile:', error);
    return null;
  }
};

// Clear user cache (useful for testing or when we know data has changed externally)
export const clearUserCache = () => {
  userCache.clear();
  console.log('User cache cleared');
};

// Clear local storage users data
export const clearLocalUsers = () => {
  localStorage.removeItem('local_users');
  sessionStorage.clear(); // Clear individual user entries in session storage
  console.log('Local users storage cleared');
};

// Force refresh a user from the API
export const forceRefreshUser = async (uid: string): Promise<IUser | null> => {
  try {
    console.log(`Force refreshing user data for ${uid} from API`);
    // Remove from cache first
    userCache.delete(uid);
    sessionStorage.removeItem(`user_${uid}`);
    
    // Fetch fresh from API
    const response = await api.get(`/users/${uid}`);
    const freshUserData = response.data;
    
    // Update cache and storage
    userCache.set(uid, { 
      data: freshUserData,
      timestamp: Date.now()
    });
    storeUserLocally(freshUserData);
    
    return freshUserData;
  } catch (error) {
    console.error(`Failed to force refresh user ${uid}:`, error);
    // Return local data if refresh fails
    return getUserFromLocalStorage(uid);
  }
};
