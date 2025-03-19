
import { User as FirebaseUser } from 'firebase/auth';
import { fetchUserByUid, createOrUpdateUser, updateUserLoginTimestamp, updateUserRole as apiUpdateUserRole, getAllUsers as apiGetAllUsers } from '../../api/mongoAPI';
import { IUser } from '../../models/User';
import { UserRole } from '@/types/auth';

// Get user by Firebase UID from MongoDB
export const getUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await fetchUserByUid(uid);
    return user;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
};

// Create user in MongoDB if not exists, handling all registration fields
export const createUserIfNotExists = async (firebaseUser: any, additionalFields?: any): Promise<IUser | null> => {
  try {
    // Check if user already exists
    let user = await fetchUserByUid(firebaseUser.uid);
    
    // If user doesn't exist, create new user
    if (!user) {
      console.log("Creating new user in MongoDB with fields:", additionalFields);
      
      // Extract additional data if it exists
      const userData: any = {
        // Default fields
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || additionalFields?.fullName || additionalFields?.ownerName || additionalFields?.name,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: additionalFields?.role || 'User',
        isAdmin: additionalFields?.isAdmin || false,
        
        // Shared fields
        phone: additionalFields?.phone || firebaseUser.phone || null,
        instagramHandle: additionalFields?.instagramHandle || null,
        facebookHandle: additionalFields?.facebookHandle || null,
        verified: additionalFields?.verified || false,
        city: additionalFields?.city || null,
        country: additionalFields?.country || null,
        
        // Influencer specific fields
        fullName: additionalFields?.fullName || null,
        niche: additionalFields?.niche || null,
        followersCount: additionalFields?.followersCount || null,
        bio: additionalFields?.bio || null,
        
        // Business specific fields
        businessName: additionalFields?.businessName || null,
        ownerName: additionalFields?.ownerName || null,
        businessCategory: additionalFields?.businessCategory || null,
        website: additionalFields?.website || null,
        gstNumber: additionalFields?.gstNumber || null,
        
        // Employee code field
        employeeCode: additionalFields?.employeeCode || null
      };

      // Handle address object if it exists
      if (additionalFields?.address) {
        userData.address = {
          street: additionalFields.address.street || null,
          city: additionalFields.address.city || null,
          state: additionalFields.address.state || null,
          country: additionalFields.address.country || null,
          zipCode: additionalFields.address.zipCode || null
        };
      }

      user = await createOrUpdateUser(userData);
      console.log('New user created in MongoDB:', user);
    } else if (additionalFields) {
      // If user exists but we have new additionalFields, update the user
      const updatedUserData = {
        ...user,
        ...additionalFields,
        updatedAt: new Date()
      };
      
      user = await createOrUpdateUser(updatedUserData);
      console.log('Existing user updated in MongoDB with additional fields:', user);
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// Update user's last login timestamp
export const updateUserLogin = async (uid: string): Promise<void> => {
  try {
    await updateUserLoginTimestamp(uid);
  } catch (error) {
    console.error('Error updating user login timestamp:', error);
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await apiGetAllUsers();
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
    const user = await apiUpdateUserRole(uid, role, isAdmin);
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

// Create a new user with full profile data for registration forms
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
