import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";
import { db } from "../../config/firebase";
import { doc, setDoc, getDoc, collection, query, getDocs, where, serverTimestamp } from "firebase/firestore";

export const updateUserRole = async (user: User, role: UserRole) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  try {
    localStorage.setItem(getRoleKey(user.id), role as string);
    
    const userDoc = doc(db, "users", user.id);
    await setDoc(userDoc, { role }, { merge: true });
    
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
    
    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, { isAdmin }, { merge: true });
    
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
    console.log("Fetching ALL users from Firebase collection");
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(query(usersCollection));
    
    if (querySnapshot.empty) {
      console.log("No users found in Firebase");
      return [];
    }
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("User data from Firebase:", doc.id, data);
      return {
        id: doc.id,
        email: data.email || null,
        name: data.name || data.displayName || null,
        role: data.role || null,
        isAdmin: data.isAdmin || false,
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || new Date().toISOString()
      };
    });
    
    console.log(`Successfully fetched ${users.length} users from Firebase`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      });
    });
    
    return users;
  } catch (error) {
    console.error("Error getting all users from Firebase:", error);
    return [];
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
    
    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isAdmin: userData.isAdmin,
      createdAt: new Date().toISOString(),
      lastLogin: serverTimestamp()
    });
    
    saveUserToAllUsersList(user);
    
    console.log("Test user created successfully:", userId);
    return user;
  } catch (error) {
    console.error("Error creating test user:", error);
    throw new Error(`Failed to create test user: ${error}`);
  }
};
