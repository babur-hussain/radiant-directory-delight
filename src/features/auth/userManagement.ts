
import { User, UserRole } from "../../types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { saveUserToAllUsersList } from "./authStorage";
import { db } from "../../config/firebase";
import { doc, setDoc, getDoc, collection, query, getDocs, where, serverTimestamp, orderBy, limit } from "firebase/firestore";

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
    const q = query(usersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    console.log(`Query executed, got ${querySnapshot.size} users`);
    
    if (querySnapshot.empty) {
      console.log("No users found in Firebase");
      return [];
    }
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("User data from Firebase:", doc.id, data);
      
      // Ensure name is a string
      const displayName = typeof data.name === 'boolean' 
        ? 'User' 
        : (data.name || data.displayName || null);
      
      // Ensure isAdmin is a boolean
      const adminStatus = typeof data.isAdmin === 'string' 
        ? data.isAdmin.toLowerCase() === 'true' 
        : Boolean(data.isAdmin);
        
      return {
        id: doc.id,
        email: data.email || null,
        name: displayName,
        role: data.role || null,
        isAdmin: adminStatus,
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
    
    localStorage.setItem('all_users_data', JSON.stringify(users));
    
    return users;
  } catch (error) {
    console.error("Error getting all users from Firebase:", error);
    const fallbackUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    console.log("Falling back to cached users:", fallbackUsers.length);
    return fallbackUsers;
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
    
    // Generate a unique ID for the test user
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
    
    // First save to local storage for immediate feedback
    saveUserToAllUsersList(user);
    
    // Then save to Firebase with explicit error handling
    try {
      console.log("Attempting to save user to Firebase with ID:", userId);
      
      // Use a reference to a specific document with the generated ID
      const userDoc = doc(db, "users", userId);
      
      // Create the user document data
      const userDocData = {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin,
        createdAt: new Date().toISOString(),
        lastLogin: serverTimestamp()
      };
      
      console.log("Creating user document with data:", userDocData);
      
      // Set the document data with merge option
      await setDoc(userDoc, userDocData);
      
      console.log("Test user created successfully in Firebase:", userId);
    } catch (firestoreError) {
      console.error("Firebase error while creating test user:", firestoreError);
      // Even if Firebase fails, we'll return the user since it's saved in localStorage
      console.log("User was saved to localStorage but not to Firebase");
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
          isAdmin: false
        },
        {
          email: "influencer@example.com",
          name: "Influencer User",
          role: "Influencer" as UserRole,
          isAdmin: false
        },
        {
          email: "admin@example.com",
          name: "Admin User",
          role: "Admin" as UserRole,
          isAdmin: true
        },
        {
          email: "staff@example.com",
          name: "Staff Member",
          role: "staff" as UserRole,
          isAdmin: false
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
