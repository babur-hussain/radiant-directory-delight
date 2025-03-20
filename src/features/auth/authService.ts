
import { User as FirebaseUser } from 'firebase/auth';
import { fetchUserByUid, createOrUpdateUser, updateUserRole as apiUpdateUserRole, getAllUsers as apiGetAllUsers } from '../../api/services/userAPI';
import { IUser } from '../../models/User';
import { UserRole } from '@/types/auth';
import { connectToMongoDB } from '@/config/mongodb';
import { generateEmployeeCode } from '@/utils/id-generator';

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
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB in createUserIfNotExists');
      return null;
    }
    
    // Check if user already exists
    let user = await fetchUserByUid(firebaseUser.uid);
    
    // If user doesn't exist, create new user
    if (!user) {
      console.log("Creating new user in MongoDB with fields:", additionalFields);
      
      // Determine role - either from additionalFields or default to 'User'
      const role = additionalFields?.role || 'User';
      console.log(`User role from additionalFields: ${role}`);
      
      // Generate employee code if not provided
      const employeeCode = additionalFields?.employeeCode || generateEmployeeCode();
      
      // Extract additional data if it exists
      const userData: any = {
        // Default fields
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || additionalFields?.fullName || additionalFields?.ownerName || additionalFields?.name,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: role,
        isAdmin: role === 'Admin' || additionalFields?.isAdmin || false,
        
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
        employeeCode: employeeCode
      };

      // Special case for default admin user
      if (firebaseUser.email === 'baburhussain660@gmail.com') {
        userData.isAdmin = true;
        userData.role = 'Admin';
      }

      // Handle address object if it exists
      if (additionalFields?.address) {
        userData.address = {
          street: additionalFields.address.street || null,
          city: additionalFields.address.city || additionalFields.city || null,
          state: additionalFields.address.state || null,
          country: additionalFields.address.country || additionalFields.country || null,
          zipCode: additionalFields.address.zipCode || null
        };
      }

      console.log("Creating user with data:", userData);
      user = await createOrUpdateUser(userData);
      console.log('New user created in MongoDB:', user);
    } else if (additionalFields) {
      // If user exists but we have new additionalFields, update the user
      const updatedUserData = {
        ...user,
        ...additionalFields,
        // Make sure role is preserved from additionalFields
        role: additionalFields.role || user.role,
        updatedAt: new Date()
      };
      
      // Ensure default admin always has admin role
      if (user.email === 'baburhussain660@gmail.com') {
        updatedUserData.isAdmin = true;
        updatedUserData.role = 'Admin';
      }
      
      console.log("Updating user with data:", updatedUserData);
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

// Export the updateUserLoginTimestamp function
export const updateUserLoginTimestamp = async (uid: string): Promise<void> => {
  try {
    // Just update the lastLogin field in the user document
    const existingUser = await fetchUserByUid(uid);
    if (existingUser) {
      await createOrUpdateUser({
        ...existingUser,
        lastLogin: new Date()
      });
      console.log(`Updated login timestamp for user ${uid}`);
    }
  } catch (error) {
    console.error('Error updating login timestamp:', error);
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    console.log('Fetching all users from API...');
    const users = await apiGetAllUsers();
    console.log(`Retrieved ${users.length} users from API`);
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
