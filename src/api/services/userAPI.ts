
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
    // Ensure MongoDB is connected
    await connectToMongoDB();

    // Handle the case for default admin
    if (userData.email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }

    // Get current collection
    const collection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    const index = collection.findIndex((u: any) => u.uid === userData.uid);

    if (index >= 0) {
      // Update existing user
      collection[index] = { ...collection[index], ...userData };
    } else {
      // Add new user
      collection.push(userData);
    }

    // Save back to localStorage (our mock MongoDB)
    localStorage.setItem('mongodb_User', JSON.stringify(collection));
    console.log(`User ${userData.uid} saved to database:`, userData);
    
    return userData;
  } catch (error) {
    console.warn('Error saving user to database:', error);
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

export const apiUpdateUserRole = async (uid: string, role: string, isAdmin: boolean = false) => {
  const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
  return response.data;
};

export const apiGetAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
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
    const users = await apiGetAllUsers();
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserRole = async (uid: string, role: string): Promise<IUser | null> => {
  try {
    // Default isAdmin to false or derive it from role
    const isAdmin = role === 'Admin';
    const user = await apiUpdateUserRole(uid, role, isAdmin);
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, profileData: Partial<IUser>): Promise<IUser | null> => {
  try {
    // Get existing user data
    const existingUser = await fetchUserByUid(uid);
    if (!existingUser) return null;
    
    // Merge existing data with new profile data
    const updatedUser = { 
      ...existingUser, 
      ...profileData,
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

export const createUserWithProfile = async (
  uid: string, 
  email: string, 
  role: UserRole, 
  profileData: any
): Promise<IUser | null> => {
  try {
    // Construct a complete user profile
    const userData = {
      uid,
      email,
      role,
      ...profileData,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Create the user
    const user = await createOrUpdateUser(userData);
    return user;
  } catch (error) {
    console.error('Error creating user with profile:', error);
    return null;
  }
};
