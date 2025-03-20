import { User as UserModel } from '../../models/User';
import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";
import { connectToMongoDB } from '../../config/mongodb';
import { createOrUpdateUser, fetchUserByUid, getAllUsers as getAPIAllUsers } from '@/api/services/userAPI';

export const updateUserRole = async (user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  let roleToAssign = user.role;
  
  try {
    // Special handling for default admin
    if (user.email === 'baburhussain660@gmail.com') {
      user.isAdmin = true;
      roleToAssign = 'Admin';
    }
    
    // Save to localStorage for fallback
    localStorage.setItem(getRoleKey(user.uid), roleToAssign as string);
    
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    
    if (connected) {
      // Try to update in MongoDB first through our API
      try {
        await createOrUpdateUser({
          uid: user.uid,
          role: roleToAssign,
          isAdmin: roleToAssign === 'Admin' || user.isAdmin,
          // Include other fields to ensure they don't get lost
          name: user.name || user.displayName,
          email: user.email,
          updatedAt: new Date()
        });
        
        console.log(`User role updated to ${roleToAssign} for uid ${user.uid}`);
        
        // Sync user data to ensure consistency
        await syncUserData(user.uid, { role: roleToAssign, isAdmin: roleToAssign === 'Admin' || user.isAdmin });
        
        return {
          ...user,
          role: roleToAssign,
          isAdmin: roleToAssign === 'Admin' || user.isAdmin
        };
      } catch (mongoError) {
        console.error("Error updating user role in MongoDB:", mongoError);
        // Fall back to localStorage update
      }
    }
    
    console.log("Falling back to localStorage-only update for role");
    
    // Update in localStorage all users list
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.uid === user.uid);
    
    if (userIndex >= 0) {
      allUsers[userIndex].role = roleToAssign;
      allUsers[userIndex].isAdmin = roleToAssign === 'Admin' || user.isAdmin;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return {
      ...user,
      role: roleToAssign,
      isAdmin: roleToAssign === 'Admin' || user.isAdmin
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    
    // Last resort fallback to ensure UI updates
    localStorage.setItem(getRoleKey(user.uid), roleToAssign as string);
    
    return {
      ...user,
      role: roleToAssign,
      isAdmin: roleToAssign === 'Admin' || user.isAdmin
    };
  }
};

export const updateUserPermission = async (userId: string, isAdmin: boolean) => {
  try {
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    // Update user admin status in MongoDB through API
    await createOrUpdateUser({
      uid: userId,
      isAdmin: isAdmin,
      updatedAt: new Date()
    });
    
    await syncUserData(userId, { isAdmin });
    
    return { userId, isAdmin };
  } catch (error) {
    console.error("Error updating user permission:", error);
    
    console.log("Falling back to localStorage-only update for permission");
    
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.uid === userId);
    
    if (userIndex >= 0) {
      allUsers[userIndex].isAdmin = isAdmin;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return { userId, isAdmin };
  }
};

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

// Helper function to get users from localStorage
const getLocalUsers = (): User[] => {
  console.log("Getting users from localStorage");
  try {
    // Try getting from mongodb_User collection first (our mock MongoDB)
    const mongoCollection = JSON.parse(localStorage.getItem('mongodb_User') || '[]');
    
    if (mongoCollection.length > 0) {
      console.log(`Found ${mongoCollection.length} users in mongodb_User localStorage`);
      const formattedUsers = mongoCollection.map(formatUser);
      
      // Update the all_users_data for consistency
      localStorage.setItem('all_users_data', JSON.stringify(formattedUsers));
      
      return formattedUsers;
    }
    
    // Fall back to the all_users_data collection
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    console.log(`Found ${allUsers.length} users in all_users_data localStorage`);
    
    return allUsers.map(formatUser);
  } catch (error) {
    console.error('Error getting users from localStorage:', error);
    return [];
  }
};

// Helper to format a user object consistently
const formatUser = (user: any): User => {
  return {
    uid: user.id || user.uid,
    id: user.id || user.uid,
    email: user.email,
    displayName: user.name || user.displayName,
    name: user.name || user.displayName,
    photoURL: user.photoURL,
    role: user.role || 'User',
    isAdmin: !!user.isAdmin,
    employeeCode: user.employeeCode,
    createdAt: user.createdAt || new Date().toISOString(),
    // Include all other fields
    ...user
  };
};

export interface TestUserData {
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
  employeeCode?: string;
}

export const createTestUser = async (userData: TestUserData): Promise<User> => {
  try {
    console.log("Creating test user:", userData);
    
    const userId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const user: User = {
      uid: userId,
      id: userId,
      email: userData.email,
      displayName: userData.name,
      name: userData.name,
      role: userData.role,
      isAdmin: userData.isAdmin,
      photoURL: null,
      employeeCode: userData.employeeCode || null,
      createdAt: new Date().toISOString()
    };
    
    saveUserToAllUsersList(user);
    
    try {
      console.log("Attempting to save user to MongoDB with ID:", userId);
      
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, user only saved to localStorage");
        return user;
      }
      
      await createOrUpdateUser({
        uid: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin,
        employeeCode: userData.employeeCode,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      console.log("Test user created successfully in MongoDB:", userId);
    } catch (dbError) {
      console.error("MongoDB error while creating test user:", dbError);
      console.log("User was saved to localStorage but not to MongoDB");
    }
    
    return user;
  } catch (error) {
    console.error("Critical error creating test user:", error);
    throw new Error(`Failed to create test user: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const ensureTestUsers = async (): Promise<void> => {
  try {
    const existingUsers = await getAllUsers();
    
    if (existingUsers.length === 0) {
      console.log("No users found, creating sample users");
      
      const testUsers = [
        {
          email: "business@example.com",
          name: "Business User",
          role: "Business" as UserRole,
          isAdmin: false,
          employeeCode: "EMP-B001"
        },
        {
          email: "influencer@example.com",
          name: "Influencer User",
          role: "Influencer" as UserRole,
          isAdmin: false,
          employeeCode: "EMP-I001"
        },
        {
          email: "admin@example.com",
          name: "Admin User",
          role: "Admin" as UserRole,
          isAdmin: true,
          employeeCode: "EMP-A001"
        },
        {
          email: "staff@example.com",
          name: "Staff Member",
          role: "staff" as UserRole,
          isAdmin: false,
          employeeCode: "EMP-S001"
        }
      ];
      
      for (const user of testUsers) {
        try {
          await createTestUser(user);
          console.log(`Created test user: ${user.name}`);
        } catch (userError) {
          console.error(`Failed to create test user ${user.name}:`, userError);
          // Continue with other users even if one fails
        }
      }
      
      console.log("Sample users created successfully");
    } else {
      console.log(`Found ${existingUsers.length} existing users, no need to create test users`);
    }
  } catch (error) {
    console.error("Error ensuring test users:", error);
  }
};
