
import { api } from '../core/apiService';
import { IUser } from '@/models/User';
import { UserRole } from '@/types/auth';

// API-focused operations for users
export const fetchUserByUid = async (uid: string) => {
  try {
    console.log(`Fetching user directly from API: ${uid}`);
    const response = await api.get(`/users/${uid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user from API:', error);
    return null;
  }
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
    
    try {
      // Try to get the user first
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
        const response = await api.put(`/users/${uid}`, updatedData);
        console.log('User updated via API successfully:', response.data);
        return response.data;
      } else {
        // Create new user
        console.log(`Creating new user via API with role=${formattedUserData.role}`);
        const response = await api.post('/users', formattedUserData);
        console.log('New user created via API:', response.data);
        return response.data;
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

// Direct API calls for user operations
export const updateUserLoginTimestamp = async (uid: string) => {
  try {
    console.log(`Updating login timestamp via API for user: ${uid}`);
    const response = await api.put(`/users/${uid}/login`);
    return response.data;
  } catch (error) {
    console.error('Error updating login timestamp:', error.message);
    throw error;
  }
};

export const apiUpdateUserRole = async (uid: string, role: string) => {
  try {
    const isAdmin = role === 'Admin';
    console.log(`Updating user role via API for user: ${uid}, role: ${role}, isAdmin: ${isAdmin}`);
    const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
    return response.data;
  } catch (error) {
    console.error('Error in apiUpdateUserRole:', error);
    throw error;
  }
};

export const apiGetAllUsers = async () => {
  try {
    console.log('Fetching all users from production API');
    const response = await api.get('/users');
    console.log(`Retrieved ${response.data.length} users from API`);
    return response.data;
  } catch (error) {
    console.error('Error getting all users from API:', error);
    throw error;
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
