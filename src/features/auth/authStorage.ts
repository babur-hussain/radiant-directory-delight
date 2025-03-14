
import { User, UserRole } from "../../types/auth";
import { db } from "../../config/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

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
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
      
      // Also try to save to Firebase if available
      try {
        const userDoc = doc(db, "users", adminEmail.replace(/[.@]/g, '_'));
        setDoc(userDoc, {
          email: adminEmail,
          name: 'Admin User',
          role: 'Admin',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.error("Could not save admin to Firebase:", err));
      } catch (error) {
        console.error("Error saving admin to Firebase:", error);
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
    
    if (existingUserIndex >= 0) {
      // Update existing user
      allUsers[existingUserIndex] = {
        ...allUsers[existingUserIndex],
        name: userData.name || allUsers[existingUserIndex].name,
        role: userData.role || allUsers[existingUserIndex].role,
        isAdmin: userData.isAdmin || allUsers[existingUserIndex].isAdmin || false,
        email: userData.email || allUsers[existingUserIndex].email,
        createdAt: createdAtTimestamp,
        subscription: existingSubscription || allUsers[existingUserIndex].subscription || null,
        lastUpdated: new Date().toISOString()
      };
    } else {
      // Add new user
      allUsers.push({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin || false,
        createdAt: createdAtTimestamp,
        subscription: existingSubscription || null,
        lastUpdated: new Date().toISOString()
      });
    }
    
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    console.log("Updated all users list:", allUsers);
    
    // Also try to save to Firebase if available
    try {
      const userDoc = doc(db, "users", userData.id);
      setDoc(userDoc, {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isAdmin: userData.isAdmin || false,
        createdAt: createdAtTimestamp,
        subscription: existingSubscription || null,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("Could not save user to Firebase:", err));
    } catch (error) {
      console.error("Error saving user to Firebase:", error);
    }
    
    return allUsers;
  } catch (error) {
    console.error("Error saving user to all users list:", error);
    return [];
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
      
      // Also load subscription data and merge with users
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      
      const usersWithSubscriptions = parsedUsers.map((user: any) => {
        return {
          ...user,
          subscription: userSubscriptions[user.id] || user.subscription || null
        };
      });
      
      return usersWithSubscriptions;
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
    // First try to fetch users from Firebase
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      
      if (!snapshot.empty) {
        const firebaseUsers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || null,
            name: data.name || data.displayName || null,
            role: data.role || null,
            isAdmin: data.isAdmin || false,
            createdAt: data.createdAt || new Date().toISOString(),
            subscription: data.subscription || null,
            lastUpdated: data.lastUpdated || new Date().toISOString()
          };
        });
        
        // Get subscription data
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        
        // Merge subscription data with users
        const usersWithSubscriptions = firebaseUsers.map(user => {
          return {
            ...user,
            subscription: userSubscriptions[user.id] || user.subscription || null
          };
        });
        
        // Save Firebase users to localStorage
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(usersWithSubscriptions));
        console.log("Updated all users list from Firebase:", usersWithSubscriptions);
        return usersWithSubscriptions.length;
      }
    } catch (error) {
      console.error("Error fetching users from Firebase:", error);
    }
    
    // Get all auth users from localStorage and merge with subscription data
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]');
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    
    // Check for duplicate emails and merge data if needed
    const uniqueUserMap = new Map();
    
    allUsers.forEach((user: User) => {
      if (user.email) {
        const key = user.email.toLowerCase();
        
        if (uniqueUserMap.has(key)) {
          // Merge with existing user data
          const existingUser = uniqueUserMap.get(key);
          uniqueUserMap.set(key, {
            ...existingUser,
            ...user,
            isAdmin: existingUser.isAdmin || user.isAdmin || false,
            role: user.role || existingUser.role,
            createdAt: existingUser.createdAt || user.createdAt || new Date().toISOString(),
            subscription: userSubscriptions[user.id] || existingUser.subscription || null,
            lastUpdated: new Date().toISOString()
          });
        } else {
          uniqueUserMap.set(key, {
            ...user,
            createdAt: user.createdAt || new Date().toISOString(),
            subscription: userSubscriptions[user.id] || user.subscription || null,
            lastUpdated: new Date().toISOString()
          });
        }
      }
    });
    
    // Convert back to array
    const dedupedUsers = Array.from(uniqueUserMap.values());
    
    // Save back to localStorage
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(dedupedUsers));
    
    // Try to sync with Firebase
    try {
      dedupedUsers.forEach(async (user: any) => {
        if (user.id) {
          const userDoc = doc(db, "users", user.id);
          await setDoc(userDoc, {
            email: user.email,
            name: user.name,
            role: user.role,
            isAdmin: user.isAdmin || false,
            createdAt: user.createdAt || new Date().toISOString(),
            subscription: user.subscription || null,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
      });
    } catch (error) {
      console.error("Error syncing users to Firebase:", error);
    }
    
    console.log("Current users after deduplication:", dedupedUsers);
    return dedupedUsers.length;
  } catch (error) {
    console.error("Error refreshing users:", error);
    return 0;
  }
};

// Function to sync a specific user across localStorage and Firebase
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
    
    // Then sync to Firebase
    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, updatedUserData, { merge: true });
    
    // If there's subscription data, update the userSubscriptions collection too
    if (userData.subscription) {
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[userId] = userData.subscription;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing user data:", error);
    return false;
  }
};
