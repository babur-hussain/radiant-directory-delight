
import { User, UserRole } from "../../types/auth";

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
    // Store admin status for this email
    localStorage.setItem(adminUserKey, 'true');
    
    // Store in all users list for admin panel
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const adminExists = allUsers.some((user: any) => user.email === adminEmail);
    
    if (!adminExists) {
      allUsers.push({
        id: adminEmail.replace(/[.@]/g, '_'),
        email: adminEmail,
        name: 'Admin User',
        role: 'Admin',
        isAdmin: true
      });
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    }
  }
};

// Helper to save user to the all-users list
export const saveUserToAllUsersList = (userData: User) => {
  try {
    console.log("Saving user to all users list:", userData);
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const existingUserIndex = allUsers.findIndex((u: any) => u.id === userData.id);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      allUsers[existingUserIndex] = {
        ...allUsers[existingUserIndex],
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin || false,
        email: userData.email
      };
    } else {
      // Add new user
      allUsers.push({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin || false
      });
    }
    
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    console.log("Updated all users list:", allUsers);
  } catch (error) {
    console.error("Error saving user to all users list:", error);
  }
};

// Load all users data
export const loadAllUsers = (): User[] => {
  try {
    console.log("Loading all users from localStorage");
    const allUsersJson = localStorage.getItem(ALL_USERS_KEY);
    if (allUsersJson) {
      const parsedUsers = JSON.parse(allUsersJson);
      console.log("Loaded users count:", parsedUsers.length);
      return parsedUsers;
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
  return [];
};

// Debug function to force a refresh of users data
export const debugRefreshUsers = () => {
  console.log("Forcing refresh of users data");
  const allUsers = loadAllUsers();
  console.log("Current users:", allUsers);
  return allUsers.length;
};
