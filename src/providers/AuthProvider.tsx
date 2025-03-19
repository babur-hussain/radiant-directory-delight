
import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { createOrUpdateUser, fetchUserByUid, updateUserLoginTimestamp } from '@/api/mongoAPI';
import Loading from '@/components/ui/loading';
import { initializeDefaultAdmin } from '../features/auth/authStorage';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Default admin email - consistent definition
  const DEFAULT_ADMIN_EMAIL = "baburhussain660@gmail.com";

  const isDefaultAdmin = (email: string | null) => {
    return email === DEFAULT_ADMIN_EMAIL;
  };

  const processUser = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const isUserDefaultAdmin = isDefaultAdmin(firebaseUser.email);
      
      // Try to fetch user from MongoDB, but don't wait too long
      let mongoUser;
      try {
        mongoUser = await Promise.race([
          fetchUserByUid(firebaseUser.uid),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("MongoDB fetch timeout")), 5000)
          )
        ]);
      } catch (error) {
        console.warn("Error fetching user from MongoDB:", error.message);
        // Continue with local data if MongoDB is unavailable
        mongoUser = null;
      }
      
      // For default admin, always ensure admin privileges
      if (isUserDefaultAdmin) {
        // Store admin status in localStorage for resilience
        localStorage.setItem(`admin_user_${firebaseUser.email?.replace(/[.@]/g, '_')}`, 'true');
        
        // If MongoDB is available, try to update user
        if (!mongoUser) {
          try {
            mongoUser = await createOrUpdateUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              lastLogin: new Date(),
              isAdmin: true,
              role: "Admin" as UserRole,
              createdAt: new Date()
            });
          } catch (error) {
            console.warn("Couldn't save admin status to MongoDB:", error);
            // Continue with local data
          }
        }
      }
      
      // Set user with admin privileges if default admin, otherwise use MongoDB data if available
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: isUserDefaultAdmin ? true : (mongoUser?.isAdmin || false),
        role: isUserDefaultAdmin ? 'Admin' as UserRole : ((mongoUser?.role as UserRole) || 'User' as UserRole)
      });
      
      // For non-default admin, try to update login timestamp, but don't block on it
      if (!isUserDefaultAdmin && mongoUser) {
        updateUserLoginTimestamp(firebaseUser.uid).catch(error => {
          console.warn("Couldn't update login timestamp:", error);
        });
      }
    } catch (error) {
      console.error("Error processing user:", error);
      
      // Fallback: Set basic user info with admin privileges if default admin
      const isUserDefaultAdmin = isDefaultAdmin(firebaseUser.email);
      
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: isUserDefaultAdmin ? true : false,
        role: isUserDefaultAdmin ? 'Admin' as UserRole : 'User' as UserRole
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        await processUser(firebaseUser);
      } catch (error) {
        console.error("Error in auth state change:", error);
        
        // On error, still set user as admin if default admin email
        if (firebaseUser && isDefaultAdmin(firebaseUser.email)) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: true,
            role: 'Admin' as UserRole
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("Auth initialized:", !!firebaseUser);
      }
    });

    // Reduce timeout for better user experience
    const initTimeout = setTimeout(() => {
      if (!initialized) {
        console.log("Auth initialization timeout reached, marking as initialized");
        setInitialized(true);
        setLoading(false);
      }
    }, 3000); // Reduced from 5000ms to 3000ms

    return () => {
      unsubscribe();
      clearTimeout(initTimeout);
    };
  }, [initialized]);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processUser(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const isUserDefaultAdmin = isDefaultAdmin(email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // For default admin, immediately set user with admin privileges
      if (isUserDefaultAdmin) {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          isAdmin: true,
          role: 'Admin' as UserRole
        });
        
        // Store admin status in localStorage
        const adminUserKey = `user_admin_${email.replace(/[.@]/g, '_')}`;
        localStorage.setItem(adminUserKey, 'true');
        
        // Initialize default admin in storage
        initializeDefaultAdmin();
        
        console.log("Email/password login successful (default admin)");
      } else {
        // For non-admin users, process normally
        await processUser(userCredential.user);
        console.log("Email/password login successful");
      }
    } catch (error: any) {
      console.error("Email/password login error:", error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error("User not found. Please check your email or register a new account.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later.");
      } else {
        throw error;
      }
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, additionalData?: any): Promise<User> => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: role || "User" as UserRole,
        isAdmin: role === "Admin",
        createdAt: new Date(),
        lastLogin: new Date(),
        ...additionalData
      };
      
      try {
        await createOrUpdateUser(userData);
      } catch (error) {
        console.error("Error saving user to MongoDB:", error);
      }
      
      await processUser(firebaseUser);
      
      console.log("Signup successful");
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: role === "Admin",
        role: role || "User" as UserRole
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Email already in use. Please log in or use a different email.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Password is too weak. Please use a stronger password.");
      } else {
        throw error;
      }
    }
  };

  const updateUserRole = async (role: UserRole): Promise<void> => {
    if (!user || !user.uid) {
      throw new Error("No authenticated user found");
    }
    
    try {
      await createOrUpdateUser({
        uid: user.uid,
        role,
        isAdmin: role === "Admin"
      });
      
      setUser({
        ...user,
        role,
        isAdmin: role === "Admin"
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    currentUser: user,
    isAuthenticated: !!user,
    loading,
    loginWithGoogle,
    logout: signOut,
    login,
    signup,
    updateUserRole,
    initialized,
    userRole: user?.role || null,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
