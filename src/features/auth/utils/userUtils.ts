
import { User } from "@/types/auth";

// Helper to format a user object consistently
export const formatUser = (user: any): User => {
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

// Helper function to get users from localStorage
export const getLocalUsers = (): User[] => {
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
