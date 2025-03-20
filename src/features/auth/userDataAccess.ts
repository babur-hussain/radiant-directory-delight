import { User, UserRole } from "@/types/auth";
import { connectToMongoDB } from '@/config/mongodb';
import { createOrUpdateUser, fetchUserByUid, getAllUsers as getAPIAllUsers } from '@/api/services/userAPI';
import { formatUser, getLocalUsers } from './utils/userUtils';

const mapDatabaseUserToUser = (dbUser: any) => {
  return {
    uid: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    isAdmin: dbUser.is_admin,
    photoURL: dbUser.photo_url,
    employeeCode: dbUser.employee_code,
    createdAt: dbUser.created_at || new Date().toISOString(),
    lastLogin: dbUser.last_login || dbUser.created_at,
    
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

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // First try to get user from MongoDB through API
    const mongoUser = await fetchUserByUid(userId);
    
    if (mongoUser) {
      return mapDatabaseUserToUser(mongoUser);
    }
    
    // Fall back to localStorage
    console.log(`User ${userId} not found in MongoDB, checking localStorage`);
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId || u.uid === userId);
    
    if (user) {
      // Make sure returned user conforms to User interface
      return mapDatabaseUserToUser(user);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    
    // Last resort fallback to localStorage
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId || u.uid === userId);
    
    if (user) {
      return mapDatabaseUserToUser(user);
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
      const apiUsers = await getAPIAllUsers();
      
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        console.log(`Retrieved ${apiUsers.length} users from MongoDB API`);
        
        // Format the users properly and save to localStorage
        const formattedUsers = apiUsers.map((user: any) => mapDatabaseUserToUser(user));
        
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
