
import { User as UserModel } from '../../models/User';
import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";

export const updateUserRole = async (user: User, role: UserRole) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  try {
    localStorage.setItem(getRoleKey(user.id), role as string);
    
    // Update user role in MongoDB
    await UserModel.findOneAndUpdate(
      { uid: user.id },
      { role: role }
    );
    
    await syncUserData(user.id, { role });
    
    return {
      ...user,
      role
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    
    console.log("Falling back to localStorage-only update for role");
    
    localStorage.setItem(getRoleKey(user.id), role as string);
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    
    if (userIndex >= 0) {
      allUsers[userIndex].role = role;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return {
      ...user,
      role
    };
  }
};

export const updateUserPermission = async (userId: string, isAdmin: boolean) => {
  try {
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    // Update user admin status in MongoDB
    await UserModel.findOneAndUpdate(
      { uid: userId },
      { isAdmin: isAdmin }
    );
    
    await syncUserData(userId, { isAdmin });
    
    return { userId, isAdmin };
  } catch (error) {
    console.error("Error updating user permission:", error);
    
    console.log("Falling back to localStorage-only update for permission");
    
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === userId);
    
    if (userIndex >= 0) {
      allUsers[userIndex].isAdmin = isAdmin;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return { userId, isAdmin };
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Get user from MongoDB
    const mongoUser = await UserModel.findOne({ uid: userId });
    
    if (mongoUser) {
      return {
        id: userId,
        email: mongoUser.email,
        name: mongoUser.name,
        role: mongoUser.role as UserRole,
        isAdmin: mongoUser.isAdmin,
        photoURL: mongoUser.photoURL,
        createdAt: mongoUser.createdAt.toISOString()
      };
    }
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId);
    
    if (user) {
      return user as User;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId);
    
    if (user) {
      return user as User;
    }
    
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log("Fetching ALL users from MongoDB collection");
    
    // Get all users from MongoDB, ordered by creation date
    const mongoUsers = await UserModel.find().sort({ createdAt: -1 });
    
    console.log(`Query executed, got ${mongoUsers.length} users`);
    
    if (mongoUsers.length === 0) {
      console.log("No users found in MongoDB");
      return [];
    }
    
    const users = mongoUsers.map(mongoUser => {
      console.log("User data from MongoDB:", mongoUser.uid, mongoUser);
      
      // Ensure name is a string - Fix TypeScript never type error
      let displayName: string | null = null;
      if (mongoUser.name === null) {
        displayName = null;
      } else if (typeof mongoUser.name === 'boolean') {
        displayName = 'User';
      } else if (typeof mongoUser.name === 'string') {
        displayName = mongoUser.name;
      } else if (mongoUser.name) {
        // Only call toString if name exists and is not null
        try {
          displayName = String(mongoUser.name);
        } catch {
          displayName = null;
        }
      } else {
        displayName = null;
      }
      
      // Convert MongoDB date to ISO string
      let createdTimestamp = mongoUser.createdAt?.toISOString() || new Date().toISOString();
      
      return {
        id: mongoUser.uid,
        email: mongoUser.email,
        name: displayName,
        role: mongoUser.role as UserRole,
        isAdmin: mongoUser.isAdmin,
        photoURL: mongoUser.photoURL,
        createdAt: createdTimestamp
      };
    });
    
    console.log(`Successfully fetched ${users.length} users from MongoDB`);
    
    // Log each user to verify all are being processed
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      });
    });
    
    // Ensure we're correctly saving to localStorage
    localStorage.setItem('all_users_data', JSON.stringify(users));
    
    return users;
  } catch (error) {
    console.error("Error getting all users from MongoDB:", error);
    const fallbackUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    console.log("Falling back to cached users:", fallbackUsers.length);
    return fallbackUsers;
  }
};

export interface TestUserData {
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
}

export const createTestUser = async (userData: TestUserData): Promise<User> => {
  try {
    console.log("Creating test user:", userData);
    
    // Generate a unique ID for the test user
    const userId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const user = {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isAdmin: userData.isAdmin,
      photoURL: null,
      createdAt: new Date().toISOString()
    };
    
    // First save to local storage for immediate feedback
    saveUserToAllUsersList(user);
    
    // Then save to MongoDB with explicit error handling
    try {
      console.log("Attempting to save user to MongoDB with ID:", userId);
      
      // Create the user document in MongoDB
      await UserModel.create({
        uid: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      console.log("Test user created successfully in MongoDB:", userId);
    } catch (dbError) {
      console.error("MongoDB error while creating test user:", dbError);
      // Even if MongoDB fails, we'll return the user since it's saved in localStorage
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
          isAdmin: false
        },
        {
          email: "influencer@example.com",
          name: "Influencer User",
          role: "Influencer" as UserRole,
          isAdmin: false
        },
        {
          email: "admin@example.com",
          name: "Admin User",
          role: "Admin" as UserRole,
          isAdmin: true
        },
        {
          email: "staff@example.com",
          name: "Staff Member",
          role: "staff" as UserRole,
          isAdmin: false
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
