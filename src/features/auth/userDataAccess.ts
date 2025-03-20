
import { User, UserRole } from "@/types/auth";
import { connectToMongoDB } from '@/config/mongodb';
import { createOrUpdateUser, fetchUserByUid, getAllUsers as getAPIAllUsers } from '@/api/services/userAPI';
import { formatUser, getLocalUsers } from './utils/userUtils';

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // First try to get user from MongoDB through API
    const mongoUser = await fetchUserByUid(userId);
    
    if (mongoUser) {
      return {
        uid: userId,
        id: userId, // Alias for uid for compatibility
        email: mongoUser.email,
        displayName: mongoUser.name,
        name: mongoUser.name,
        role: mongoUser.role as UserRole,
        isAdmin: mongoUser.isAdmin,
        photoURL: mongoUser.photoURL,
        employeeCode: mongoUser.employeeCode,
        createdAt: mongoUser.createdAt?.toISOString?.() || mongoUser.createdAt,
        // Include all additional fields that might be needed
        phone: mongoUser.phone,
        instagramHandle: mongoUser.instagramHandle,
        facebookHandle: mongoUser.facebookHandle,
        niche: mongoUser.niche,
        followersCount: mongoUser.followersCount,
        bio: mongoUser.bio,
        businessName: mongoUser.businessName,
        ownerName: mongoUser.ownerName,
        businessCategory: mongoUser.businessCategory,
        website: mongoUser.website,
        gstNumber: mongoUser.gstNumber,
        subscription: mongoUser.subscription,
        // Other metadata
        city: mongoUser.city,
        country: mongoUser.country,
        verified: mongoUser.verified
      };
    }
    
    // Fall back to localStorage
    console.log(`User ${userId} not found in MongoDB, checking localStorage`);
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId || u.uid === userId);
    
    if (user) {
      // Make sure returned user conforms to User interface
      return {
        uid: user.id || user.uid,
        id: user.id || user.uid,
        email: user.email,
        displayName: user.name || user.displayName,
        name: user.name || user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        isAdmin: user.isAdmin,
        employeeCode: user.employeeCode,
        createdAt: user.createdAt,
        // Include all other fields we have
        ...user
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    
    // Last resort fallback to localStorage
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId || u.uid === userId);
    
    if (user) {
      return {
        uid: user.id || user.uid,
        id: user.id || user.uid,
        email: user.email,
        displayName: user.name || user.displayName,
        name: user.name || user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        isAdmin: user.isAdmin,
        employeeCode: user.employeeCode,
        createdAt: user.createdAt,
        // Include all other fields we have
        ...user
      };
    }
    
    return null;
  }
};

// Updated: Direct access to localStorage data to ensure users are loaded
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching ALL users from MongoDB collection");
    
    // First ensure MongoDB is connected with a clear error message
    console.log("Checking MongoDB connection...");
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error("MongoDB connection failed - could not establish connection");
      // Instead of throwing an error, let's fall back to localStorage
      console.log("Falling back to localStorage for user data");
      return getLocalUsers();
    }
    
    console.log("MongoDB connection verified");
    
    // Try to get users from the API first
    try {
      const mongoUsers = await getAPIAllUsers();
      
      if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
        console.log(`Retrieved ${mongoUsers.length} users from MongoDB API`);
        
        // Format the users properly and save to localStorage
        const formattedUsers = mongoUsers.map(formatUser);
        localStorage.setItem('all_users_data', JSON.stringify(formattedUsers));
        
        return formattedUsers;
      } else {
        console.warn('No users returned from API, checking localStorage');
      }
    } catch (apiError) {
      console.error('Error fetching users from API:', apiError);
    }
    
    // Fall back to direct localStorage access
    return getLocalUsers();
  } catch (error) {
    console.error("Error getting all users from MongoDB:", error);
    
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    // Last resort: return from localStorage
    return getLocalUsers();
  }
};
