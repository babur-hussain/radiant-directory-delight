
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { User } from "@/types/auth";

// Define a type for the raw Firestore user data
interface FirestoreUserData {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  isAdmin?: boolean;
  createdAt: any;
  [key: string]: any; // Allow for other properties
}

/**
 * Debug utility to get raw users data from Firestore
 * This can be called in the browser console to debug firestore issues
 */
export const debugFirestoreUsers = async (): Promise<FirestoreUserData[]> => {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    console.log(`Firestore debug: Found ${querySnapshot.size} users`);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to ISO string if needed
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt
      } as FirestoreUserData;
    });
    
    // Log each user individually for better debugging
    users.forEach((user, index) => {
      console.log(`Firestore user ${index + 1}:`, {
        id: user.id,
        email: user.email || 'N/A',
        name: user.name || 'N/A',
        role: user.role || 'N/A',
        isAdmin: user.isAdmin || false
      });
    });
    
    console.log("Raw Firestore users:", users);
    
    return users;
  } catch (error) {
    console.error("Error in debugFirestoreUsers:", error);
    return [];
  }
};

/**
 * Debug utility to check localStorage stored users
 */
export const debugLocalStorageUsers = (): FirestoreUserData[] => {
  try {
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]') as FirestoreUserData[];
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
 * Compare Firestore and localStorage users to identify discrepancies
 */
export const compareUserSources = async () => {
  const firestoreUsers = await debugFirestoreUsers();
  const localStorageUsers = debugLocalStorageUsers();
  
  console.log('------ User Source Comparison ------');
  console.log(`Firestore: ${firestoreUsers.length} users`);
  console.log(`LocalStorage: ${localStorageUsers.length} users`);
  
  // Check for users in Firestore but not in localStorage
  const missingInLocalStorage = firestoreUsers.filter(
    fsUser => !localStorageUsers.some(lsUser => lsUser.id === fsUser.id)
  );
  
  if (missingInLocalStorage.length > 0) {
    console.log(`Found ${missingInLocalStorage.length} users in Firestore but missing in localStorage:`, 
      missingInLocalStorage.map(user => ({ id: user.id, email: user.email || 'N/A' })));
  }
  
  // Check for users in localStorage but not in Firestore
  const missingInFirestore = localStorageUsers.filter(
    lsUser => !firestoreUsers.some(fsUser => fsUser.id === lsUser.id)
  );
  
  if (missingInFirestore.length > 0) {
    console.log(`Found ${missingInFirestore.length} users in localStorage but missing in Firestore:`, 
      missingInFirestore.map(user => ({ id: user.id, email: user.email || 'N/A' })));
  }
  
  return {
    firestoreUsers,
    localStorageUsers,
    missingInLocalStorage,
    missingInFirestore
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
