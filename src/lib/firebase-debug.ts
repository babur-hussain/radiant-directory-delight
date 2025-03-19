
import { User } from "@/types/auth";

// Define a type for user data
interface UserData {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  createdAt: any;
  [key: string]: any; // Allow for other properties
}

/**
 * Debug utility to get users data (MongoDB version)
 * Note: This is a stub since we migrated from Firestore to MongoDB
 */
export const debugFirestoreUsers = async (): Promise<UserData[]> => {
  console.log("Using MongoDB for data storage - this Firestore debug function is now a stub");
  return [];
};

/**
 * Debug utility to check localStorage stored users
 */
export const debugLocalStorageUsers = (): UserData[] => {
  try {
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]') as UserData[];
    console.log(`LocalStorage debug: Found ${allUsers.length} users`);
    
    // Log each user individually for better debugging
    allUsers.forEach((user, index) => {
      console.log(`LocalStorage user ${index + 1}:`, {
        id: user.id,
        email: user.email || 'N/A',
        name: user.name || 'N/A',
        role: user.role || 'N/A',
        isAdmin: user.isAdmin || false
      });
    });
    
    console.log("Raw localStorage users:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Error in debugLocalStorageUsers:", error);
    return [];
  }
};

/**
 * Compare data sources (MongoDB now the source of truth)
 */
export const compareUserSources = async () => {
  console.log('Data migration to MongoDB is complete. Use MongoDB utilities for debugging.');
  return {
    firestoreUsers: [],
    localStorageUsers: debugLocalStorageUsers(),
    missingInLocalStorage: [],
    missingInFirestore: []
  };
};

// Make these functions available globally for debugging
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugFirestoreUsers = debugFirestoreUsers;
  // @ts-ignore
  window.debugLocalStorageUsers = debugLocalStorageUsers;
  // @ts-ignore
  window.compareUserSources = compareUserSources;
}
