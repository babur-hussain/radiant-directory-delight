
import { User, UserRole } from "../../types/auth";
import axios from 'axios';

// Keys for storing user data in localStorage
export const getRoleKey = (userId: string) => `user_role_${userId}`;
export const getAdminKey = (userId: string) => `user_admin_${userId}`;
export const ALL_USERS_KEY = 'all_users_data';

// Initialize default admin
export const initializeDefaultAdmin = () => {
  const adminEmail = "baburhussain660@gmail.com";
  const adminUserKey = `user_admin_${adminEmail.replace(/[.@]/g, '_')}`;
  
  // Check if we've already set up the admin
  if (!localStorage.getItem(adminUserKey)) {
    console.log("Setting up default admin user:", adminEmail);
    // Store admin status for this email
    localStorage.setItem(adminUserKey, 'true');
    
    // Store in all users list for admin panel
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const adminExists = allUsers.some((user: any) => user.email === adminEmail);
    
    if (!adminExists) {
      const adminUser = {
        id: adminEmail.replace(/[.@]/g, '_'),
        uid: adminEmail.replace(/[.@]/g, '_'), // Ensure uid is also set
        email: adminEmail,
        name: 'Admin User',
        role: 'Admin',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      allUsers.push(adminUser);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
      
      // Also save to MongoDB
      try {
        axios.post('http://localhost:3001/api/users', adminUser)
          .then(() => console.log("Default admin saved to MongoDB"))
          .catch(err => console.error("Could not save admin to MongoDB:", err));
      } catch (error) {
        console.error("Error saving admin to MongoDB:", error);
      }
    }
  }
};

// Helper to save user to the all-users list
export const saveUserToAllUsersList = (userData: User) => {
  try {
    console.log("Saving user to all users list:", userData);
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const existingUserIndex = allUsers.findIndex((u: any) => u.id === userData.id);
    
    // Get the createdAt timestamp, either from the User object or existing data
    const createdAtTimestamp = (userData as any).createdAt || 
                               (existingUserIndex >= 0 ? allUsers[existingUserIndex].createdAt : null) ||
                               new Date().toISOString();
    
    // Check for existing subscriptions
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    const existingSubscription = userSubscriptions[userData.id] || null;
    
    const updatedUserData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isAdmin: userData.isAdmin || false,
      createdAt: createdAtTimestamp,
      subscription: existingSubscription || null,
      lastUpdated: new Date().toISOString()
    };
    
    if (existingUserIndex >= 0) {
      // Update existing user
      allUsers[existingUserIndex] = {
        ...allUsers[existingUserIndex],
        ...updatedUserData
      };
    } else {
      // Add new user
      allUsers.push(updatedUserData);
    }
    
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    console.log("Updated all users list:", allUsers);
    
    // Also save to MongoDB
    try {
      axios.post('http://localhost:3001/api/users', updatedUserData)
        .catch(err => console.error("Could not save user to MongoDB:", err));
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
    }
    
    return allUsers;
  } catch (error) {
    console.error("Error saving user to all users list:", error);
    return [];
  }
};

// Load all users data
export const loadAllUsers = async (): Promise<User[]> => {
  try {
    console.log("Loading all users from MongoDB");
    
    // First try MongoDB
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      const users = response.data;
      console.log("Loaded users from MongoDB:", users.length);
      
      // Update localStorage with MongoDB data
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
      
      return users;
    } catch (mongoError) {
      console.error("Error loading users from MongoDB:", mongoError);
      
      // Fall back to localStorage
      const allUsersJson = localStorage.getItem(ALL_USERS_KEY);
      if (allUsersJson) {
        const parsedUsers = JSON.parse(allUsersJson);
        console.log("Loaded users from localStorage:", parsedUsers.length);
        return parsedUsers;
      }
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
  return [];
};

// Debug function to force a refresh of users data
export const debugRefreshUsers = async () => {
  console.log("Forcing refresh of users data");
  try {
    // Fetch users from MongoDB
    const response = await axios.get('http://localhost:3001/api/users');
    const mongoUsers = response.data;
    
    if (mongoUsers.length > 0) {
      // Get subscription data
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      
      // Merge subscription data with users
      const usersWithSubscriptions = mongoUsers.map((user: any) => {
        return {
          ...user,
          subscription: userSubscriptions[user.id] || user.subscription || null
        };
      });
      
      // Save to localStorage
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(usersWithSubscriptions));
      console.log("Updated all users list from MongoDB:", usersWithSubscriptions);
      return usersWithSubscriptions.length;
    }
    
    // If MongoDB is empty, use localStorage data
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    
    // Sync localStorage users to MongoDB
    for (const user of allUsers) {
      try {
        await axios.post('http://localhost:3001/api/users', user);
      } catch (error) {
        console.error("Error syncing user to MongoDB:", error);
      }
    }
    
    return allUsers.length;
  } catch (error) {
    console.error("Error refreshing users:", error);
    return 0;
  }
};

// Function to sync a specific user
export const syncUserData = async (userId: string, userData: any) => {
  try {
    // First update in localStorage
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === userId);
    
    // Get the createdAt timestamp, either from existing data or generate new one
    const createdAtTimestamp = (userIndex >= 0 ? allUsers[userIndex].createdAt : null) || 
                               new Date().toISOString();
    
    // Get current user record or create new one                           
    const currentUserData = userIndex >= 0 ? allUsers[userIndex] : { id: userId };
    
    // Create updated user record with merged data
    const updatedUserData = {
      ...currentUserData,
      ...userData,
      lastUpdated: new Date().toISOString(),
      createdAt: createdAtTimestamp
    };
    
    // Update the users array
    if (userIndex >= 0) {
      allUsers[userIndex] = updatedUserData;
    } else {
      allUsers.push(updatedUserData);
    }
    
    // Save updated users to localStorage
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    
    // Update MongoDB
    await axios.post('http://localhost:3001/api/users', updatedUserData);
    
    // If there's subscription data, ensure it's properly stored
    if (userData.subscription) {
      console.log("Syncing subscription data to MongoDB:", userData.subscription);
      
      // Update userSubscriptions in localStorage too
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[userId] = userData.subscription;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Update subscription in MongoDB
      try {
        await axios.post('http://localhost:3001/api/subscriptions', userData.subscription);
      } catch (subscriptionError) {
        console.error("Error syncing subscription to MongoDB:", subscriptionError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing user data:", error);
    return false;
  }
};
