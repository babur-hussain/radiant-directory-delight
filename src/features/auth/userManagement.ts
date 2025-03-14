
import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";
import { db } from "../../config/firebase";
import { doc, setDoc, getDoc, collection, query, getDocs } from "firebase/firestore";

export const updateUserRole = async (user: User, role: UserRole) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  try {
    // Store the updated role in localStorage
    localStorage.setItem(getRoleKey(user.id), role as string);
    
    // Update in Firebase
    const userDoc = doc(db, "users", user.id);
    await setDoc(userDoc, { role }, { merge: true });
    
    // Sync with all users list (also updates Firebase)
    await syncUserData(user.id, { role });
    
    // Return updated user object
    return {
      ...user,
      role
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    
    // Fallback to localStorage-only update
    console.log("Falling back to localStorage-only update for role");
    
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
  }
};

export const updateUserPermission = async (userId: string, isAdmin: boolean) => {
  try {
    // Store the admin status in localStorage
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    // Update in Firebase
    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, { isAdmin }, { merge: true });
    
    // Sync with all users list (also updates Firebase)
    await syncUserData(userId, { isAdmin });
    
    return { userId, isAdmin };
  } catch (error) {
    console.error("Error updating user permission:", error);
    
    // Fallback to localStorage-only update
    console.log("Falling back to localStorage-only update for permission");
    
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
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // First try to get from Firebase
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: userId,
        email: data.email || null,
        name: data.name || null,
        role: data.role || null,
        isAdmin: data.isAdmin || false,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }
    
    // If not found in Firebase, try localStorage
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId);
    
    if (user) {
      return user as User;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    
    // Fallback to localStorage
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const user = allUsers.find((u: any) => u.id === userId);
    
    if (user) {
      return user as User;
    }
    
    return null;
  }
};

// Get all users from Firebase
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(query(usersCollection));
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || null,
        name: data.name || null,
        role: data.role || null,
        isAdmin: data.isAdmin || false,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
};
