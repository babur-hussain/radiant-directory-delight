
import { User as FirebaseUser } from 'firebase/auth';
import { fetchUserByUid, createOrUpdateUser, updateUserLoginTimestamp, updateUserRole as apiUpdateUserRole, getAllUsers as apiGetAllUsers } from '../../api/mongoAPI';
import { IUser } from '../../models/User';

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

// Create user in MongoDB if not exists
export const createUserIfNotExists = async (firebaseUser: any): Promise<IUser | null> => {
  try {
    // Check if user already exists
    let user = await fetchUserByUid(firebaseUser.uid);
    
    // If user doesn't exist, create new user
    if (!user) {
      // Extract additional data if it exists
      const additionalData = {
        // Default fields
        role: 'User',
        isAdmin: false,
        
        // Shared fields that might be in additionalData
        phone: firebaseUser.phone || null,
        instagramHandle: firebaseUser.instagramHandle || null,
        facebookHandle: firebaseUser.facebookHandle || null,
        verified: firebaseUser.verified || false,
        city: firebaseUser.city || null,
        country: firebaseUser.country || null,
        
        // Influencer specific fields
        niche: firebaseUser.niche || null,
        followersCount: firebaseUser.followersCount || null,
        bio: firebaseUser.bio || null,
        
        // Business specific fields
        businessName: firebaseUser.businessName || null,
        ownerName: firebaseUser.ownerName || null,
        businessCategory: firebaseUser.businessCategory || null,
        website: firebaseUser.website || null,
        gstNumber: firebaseUser.gstNumber || null
      };

      // Handle address object if it exists
      const address = firebaseUser.address ? {
        street: firebaseUser.address.street || null,
        city: firebaseUser.address.city || null,
        state: firebaseUser.address.state || null,
        country: firebaseUser.address.country || null,
        zipCode: firebaseUser.address.zipCode || null
      } : undefined;

      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...additionalData,
        ...(address ? { address } : {})
      };

      user = await createOrUpdateUser(userData);
      console.log('New user created in MongoDB:', user);
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// Update user's last login timestamp
export const updateUserLoginTimestamp = async (uid: string): Promise<void> => {
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

// Update user role
export const updateUserRole = async (uid: string, role: string, isAdmin: boolean = false): Promise<IUser | null> => {
  try {
    const user = await apiUpdateUserRole(uid, role, isAdmin);
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, profileData: Partial<IUser>): Promise<IUser | null> => {
  try {
    // Get existing user data
    const existingUser = await fetchUserByUid(uid);
    if (!existingUser) return null;
    
    // Merge existing data with new profile data
    const updatedUser = { ...existingUser, ...profileData };
    
    // Update the user
    const user = await createOrUpdateUser(updatedUser);
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};
