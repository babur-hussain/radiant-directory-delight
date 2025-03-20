
import { User, UserRole } from "@/types/auth";
import { saveUserToAllUsersList } from "./authStorage";
import { connectToMongoDB } from '@/config/mongodb';
import { createOrUpdateUser } from '@/api/services/userAPI';
import { getAllUsers } from './userDataAccess';

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
    
    // Save to localStorage first
    saveUserToAllUsersList(user);
    
    try {
      console.log("Attempting to save user to MongoDB with ID:", userId);
      
      // Ensure MongoDB is connected
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, user only saved to localStorage");
        return user;
      }
      
      // Use createOrUpdateUser with proper data formatting
      const userToSave = {
        uid: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin,
        employeeCode: userData.employeeCode,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await createOrUpdateUser(userToSave);
      
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
