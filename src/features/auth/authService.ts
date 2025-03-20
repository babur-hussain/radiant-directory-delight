import { User as FirebaseUser } from 'firebase/auth';
import { fetchUserByUid, createOrUpdateUser, updateUserRole as apiUpdateUserRole, getAllUsers as apiGetAllUsers } from '../../api/services/userAPI';
import { IUser } from '../../models/User';
import { UserRole } from '@/types/auth';
import { generateEmployeeCode } from '@/utils/id-generator';
import { api } from '@/api/core/apiService';
import { storeUserLocally } from '@/api/core/apiService';

// Add a function to map from database fields to our model fields
const mapDatabaseUserToModel = (dbUser: any) => {
  return {
    uid: dbUser.id || dbUser.uid,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    isAdmin: dbUser.is_admin,
    photoURL: dbUser.photo_url,
    employeeCode: dbUser.employee_code,
    createdAt: dbUser.created_at ? new Date(dbUser.created_at) : new Date(),
    lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : new Date(),
    
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

// Get user by Firebase UID from production MongoDB
export const getUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await fetchUserByUid(uid);
    return mapDatabaseUserToModel(user);
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
};

// Create user in MongoDB if not exists, handling all registration fields
export const createUserIfNotExists = async (firebaseUser: any, additionalFields?: any): Promise<IUser | null> => {
  try {
    console.log("Checking if user exists in MongoDB:", firebaseUser.uid);
    
    // Check if user already exists directly via API
    let user = await fetchUserByUid(firebaseUser.uid);
    console.log("User from fetchUserByUid:", user);
    
    // If user doesn't exist, create new user
    if (!user) {
      console.log("User not found, creating new user in MongoDB with fields:", additionalFields);
      
      // Determine role - either from additionalFields or default to 'User'
      // This is critical - we need to use the role from additionalFields
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
        role: role, // Explicitly set role from additionalFields
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
      
      // Always store in local storage for offline resilience
      storeUserLocally(userData);
      
      // Make API request with non-blocking approach
      try {
        // Make a direct API call but don't wait for it
        api.post('/users', userData)
          .then(response => {
            console.log('New user created in MongoDB via API:', response.data);
            storeUserLocally(response.data); // Update local storage with server data
            return response.data;
          })
          .catch(apiErr => {
            console.error('Direct API creation failed:', apiErr.message);
          });
        
        // Return the local data immediately
        user = userData;
      } catch (apiErr) {
        console.error('Direct API creation failed:', apiErr.message);
        // Fallback to our service function - which will use cached data
        user = await createOrUpdateUser(userData);
      }
      
    } else if (additionalFields) {
      // If user exists but we have new additionalFields, update the user
      // Make sure the role is preserved from additionalFields if provided
      const updatedUserData = {
        ...user,
        ...additionalFields,
        // Make sure role is preserved from additionalFields if it exists
        role: additionalFields.role || user.role,
        updatedAt: new Date()
      };
      
      // Log the role value for debugging
      console.log(`Updating existing user with role=${additionalFields.role || user.role}`);
      
      // Ensure default admin always has admin role
      if (user.email === 'baburhussain660@gmail.com') {
        updatedUserData.isAdmin = true;
        updatedUserData.role = 'Admin';
      }
      
      console.log("Updating user with data:", updatedUserData);
      
      // Always store in local storage for offline resilience
      storeUserLocally(updatedUserData);
      
      // Make a non-blocking API call
      try {
        // Store locally first for immediate response
        user = updatedUserData;
        
        // Make direct API call in the background
        api.put(`/users/${updatedUserData.uid}`, updatedUserData)
          .then(response => {
            console.log('Existing user updated in MongoDB via API with additional fields:', response.data);
            storeUserLocally(response.data); // Update local storage with server data
          })
          .catch(apiErr => {
            console.error('Direct API update failed:', apiErr.message);
          });
      } catch (apiErr) {
        console.error('Direct API update failed:', apiErr.message);
        // Fallback to our service function - which will use cached data
        user = await createOrUpdateUser(updatedUserData);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// Update user's last login timestamp - now with offline support
export const updateUserLogin = async (uid: string): Promise<void> => {
  try {
    await updateUserLoginTimestamp(uid);
  } catch (error) {
    console.error('Error updating user login timestamp:', error);
  }
};

// Export the updateUserLoginTimestamp function - now more resilient
export const updateUserLoginTimestamp = async (uid: string): Promise<void> => {
  try {
    // Get current user data
    const userData = await fetchUserByUid(uid);
    
    // If we have user data, update the login timestamp locally
    if (userData) {
      userData.lastLogin = new Date();
      storeUserLocally(userData);
    }
    
    // Non-blocking API call - don't wait for response
    api.put(`/users/${uid}/login`)
      .then(() => console.log(`Updated login timestamp for user ${uid} via API`))
      .catch(error => console.warn(`API login timestamp update failed for ${uid}, but local data updated`));
      
  } catch (error) {
    console.error('Error updating login timestamp:', error);
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    console.log('Fetching all users from production API...');
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
    // Direct API call to update role
    const response = await api.put(`/users/${uid}/role`, { role, isAdmin });
    return response.data;
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
    
    // Direct API call to update profile
    const response = await api.put(`/users/${uid}`, updatedUser);
    return response.data;
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
      role, // Explicitly set role
      isAdmin: role === 'Admin',
      ...profileData,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Log the role for debugging
    console.log(`Creating user with profile, role=${role}`);
    
    // Special case for default admin user
    if (email === 'baburhussain660@gmail.com') {
      userData.isAdmin = true;
      userData.role = 'Admin';
    }
    
    // Direct API call to create user
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user with profile:', error);
    return null;
  }
};
