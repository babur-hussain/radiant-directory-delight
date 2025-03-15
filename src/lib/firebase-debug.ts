
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

/**
 * Debug utility to get raw users data from Firestore
 * This can be called in the browser console to debug firestore issues
 */
export const debugFirestoreUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    
    console.log(`Firestore debug: Found ${querySnapshot.size} users`);
    
    const users = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      };
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
export const debugLocalStorageUsers = () => {
  try {
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    console.log(`LocalStorage debug: Found ${allUsers.length} users`);
    console.log("Raw localStorage users:", allUsers);
    return allUsers;
  } catch (error) {
    console.error("Error in debugLocalStorageUsers:", error);
    return [];
  }
};

// Make these functions available globally for debugging
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugFirestoreUsers = debugFirestoreUsers;
  // @ts-ignore
  window.debugLocalStorageUsers = debugLocalStorageUsers;
}
