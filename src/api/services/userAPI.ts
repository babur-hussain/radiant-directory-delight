import { api } from '../core/apiService';
import { connectToMongoDB } from '@/config/mongodb';
import { IUser } from '@/models/User';
import { UserRole } from '@/types/auth';

// Database operations for users
export const fetchUserByUid = async (uid: string) => {
  try {
    // Ensure MongoDB is connected
    await connectToMongoDB();
    
    // Get data from localStorage (our mock MongoDB)
    const collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    const user = collection.find((u: any) => u.uid === uid);
    
    if (!user) {
      console.log(`User ${uid} not found in database`);
      return null;
    }

    console.log(`Found user in database:`, user);
    return user;
  } catch (error) {
    console.warn('Error fetching user from database:', error);
    return null;
  }
};

export const createOrUpdateUser = async (userData: any) => {
  try {
    // Ensure MongoDB is connected with clear logging
    console.log(`Attempting to create/update user: ${userData.uid} (${userData.email})`);
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error('Failed to connect to MongoDB, cannot save user data');
      return userData;
    }
    
    console.log('Creating/updating user with data:', userData);

    // Handle the case for default admin
    if (userData.email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }

    // Get current collection
    let collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    
    // Enhance logging for debugging
    console.log(`Current mongodb_User collection has ${collection.length} users`);
    
    // Properly handle uid matching (sometimes it's id instead of uid)
    const uid = userData.uid || userData.id;
    if (!uid) {
      console.error('User data missing uid/id field:', userData);
      return userData;
    }
    
    const index = collection.findIndex((u: any) => u.uid === uid || u.id === uid);
    console.log(`User search result: index=${index} for uid=${uid}`);

    // Log the original role for debugging
    const originalRole = userData.role;
    console.log(`Original role from userData: ${originalRole}`);

    // Format user data to ensure all required fields are present
    const formattedUserData = {
      ...userData,
      uid: uid, // Ensure uid is set
      createdAt: userData.createdAt || new Date(),
      lastLogin: userData.lastLogin || new Date(),
      // CRITICAL: Preserve the role from userData or default to existing role or 'User'
      role: userData.role || (index >= 0 ? collection[index].role : 'User'),
      isAdmin: userData.isAdmin || false
    };

    console.log(`Formatted user data role: ${formattedUserData.role}`);
    console.log(`Formatted user data: ${JSON.stringify(formattedUserData)}`);

    if (index >= 0) {
      // Update existing user but preserve the role if not explicitly changed
      // CRITICAL: We need to ensure role is maintained from userData if provided
      collection[index] = { 
        ...collection[index], 
        ...formattedUserData,
        // Only update role if explicitly provided in userData
        role: userData.role || collection[index].role
      };
      
      console.log(`Updated existing user in database with role=${collection[index].role}`);
      console.log(`Updated existing user in database:`, collection[index]);
    } else {
      // Add new user - ensure we have all required fields
      console.log(`Adding new user to database with uid=${uid} and role=${formattedUserData.role}`);
      collection.push(formattedUserData);
      console.log(`Added new user to database:`, formattedUserData);
    }

    // Save back to localStorage (our mock MongoDB)
    localStorage.setItem('mongodb_User', JSON.stringify(collection));
    console.log(`User ${uid} saved to mongodb_User collection successfully`);
    
    // Also save to all_users_data for compatibility with existing code
    try {
      let allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.uid === uid || u.id === uid);
      
      const formattedUser = {
        uid: uid,
        id: uid,
        email: formattedUserData.email,
        displayName: formattedUserData.name || formattedUserData.displayName,
        name: formattedUserData.name || formattedUserData.displayName,
        photoURL: formattedUserData.photoURL,
        // CRITICAL: Ensure role is preserved
        role: formattedUserData.role,
        isAdmin: formattedUserData.isAdmin || false,
        employeeCode: formattedUserData.employeeCode,
        createdAt: formattedUserData.createdAt,
        // Include other fields
        ...formattedUserData
      };
      
      // Log role for debugging
      console.log(`Saving to all_users_data with role=${formattedUser.role}`);
      
      if (userIndex >= 0) {
        // Update but preserve role if not explicitly changed
        allUsers[userIndex] = { 
          ...allUsers[userIndex], 
          ...formattedUser,
          // This is CRITICAL - we need to use the role from userData if provided
          role: userData.role || allUsers[userIndex].role
        };
        console.log(`Updated existing user in all_users_data with role=${allUsers[userIndex].role}`);
      } else {
        allUsers.push(formattedUser);
        console.log(`Added new user to all_users_data with role=${formattedUser.role}`);
      }
      
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
      console.log(`User also saved to all_users_data collection`);
      
      // Force update both collections in storage to ensure data is saved
      // Re-read and rewrite to make sure changes are persisted
      collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
      localStorage.setItem('mongodb_User', JSON.stringify(collection));
      
      allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
      
    } catch (error) {
      console.warn('Error saving to all_users_data:', error);
    }
    
    // Return the updated or created user data
    return formattedUserData;
  } catch (error) {
    console.error('Error saving user to database:', error);
    return userData;
  }
};

// Direct API calls for user operations
export const updateUserLoginTimestamp = async (uid: string) => {
  try {
    await api.put(`/users/${uid}/login`);
  } catch (error) {
    console.warn('Error updating login timestamp:', error.message);
    // Non-critical operation, can continue without it
  }
};

export const apiUpdateUserRole = async (uid: string, role: string) => {
  try {
    // Removed the isAdmin parameter to match the usage in authService.ts
    const isAdmin = role === 'Admin'; // Calculate it here instead
    const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
    return response.data;
  } catch (error) {
    console.error('Error in apiUpdateUserRole:', error);
    // Update locally as fallback
    const user = await fetchUserByUid(uid);
    if (user) {
      const isAdmin = role === 'Admin';
      await createOrUpdateUser({ ...user, role, isAdmin });
      return { ...user, role, isAdmin };
    }
    throw error;
  }
};

export const apiGetAllUsers = async () => {
  try {
    // Try to get from API first
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.warn('Error getting users from API, falling back to localStorage:', error);
    // Fallback to localStorage
    const collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    return collection;
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
    console.log('Getting all users from MongoDB...');
    const users = await apiGetAllUsers();
    console.log(`Retrieved ${users.length} users from MongoDB`);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Update user role - fixed to expect uid and role parameters
export const updateUserRole = async (uid: string, role: string): Promise<IUser | null> => {
  try {
    // Default isAdmin to false or derive it from role
    const isAdmin = role === 'Admin';
    // Fix: this function only expects 2 params - uid and role
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
    
    // Update the user
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
    // Log role for debugging
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
    
    // Create the user
    const user = await createOrUpdateUser(userData);
    return user;
  } catch (error) {
    console.error('Error creating user with profile:', error);
    return null;
  }
};
