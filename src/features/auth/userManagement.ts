
import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";

export const updateUserRole = async (user: User, role: UserRole) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Store the updated role in localStorage
  localStorage.setItem(getRoleKey(user.id), role as string);
  
  // Update all users list
  const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
  const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
  
  if (userIndex >= 0) {
    allUsers[userIndex].role = role;
    localStorage.setItem('all_users_data', JSON.stringify(allUsers));
  }
  
  // Return updated user object
  return {
    ...user,
    role
  };
};

export const updateUserPermission = async (userId: string, isAdmin: boolean) => {
  // Store the admin status in localStorage
  localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
  
  // Update all users list
  const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
  const userIndex = allUsers.findIndex((u: any) => u.id === userId);
  
  if (userIndex >= 0) {
    allUsers[userIndex].isAdmin = isAdmin;
    localStorage.setItem('all_users_data', JSON.stringify(allUsers));
  }
  
  return { userId, isAdmin };
};
