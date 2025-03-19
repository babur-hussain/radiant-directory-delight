
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

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Convert Firebase user to our User type and save to MongoDB
  const processUser = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // First, check if user exists in MongoDB
      let mongoUser = await fetchUserByUid(firebaseUser.uid);
      
      // Prepare the user data
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        lastLogin: new Date()
      };
      
      // If user doesn't exist, create a new one
      if (!mongoUser) {
        console.log("Creating new user in MongoDB");
        try {
          mongoUser = await createOrUpdateUser({
            ...userData,
            role: "User" as UserRole, // Cast as UserRole to satisfy type constraint
            isAdmin: false,
            createdAt: new Date()
          });
        } catch (error) {
          console.error("Error creating user in MongoDB:", error);
          // Use a default user object if MongoDB is unavailable
          mongoUser = {
            uid: firebaseUser.uid,
            role: "User" as UserRole,
            isAdmin: false
          };
        }
      } else {
        // Just update the last login time
        try {
          await updateUserLoginTimestamp(firebaseUser.uid);
        } catch (error) {
          console.error("Error updating login timestamp:", error);
          // Continue anyway - non-critical operation
        }
      }
      
      // Set the user in the context with proper type casting
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: mongoUser.isAdmin || false,
        role: (mongoUser.role as UserRole) || 'User' as UserRole
      });
    } catch (error) {
      console.error("Error processing user:", error);
      // Still set the basic user info even if MongoDB operations fail
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: false,
        role: 'User' as UserRole
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        await processUser(firebaseUser);
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("Auth initialized:", !!firebaseUser);
      }
    });

    // Set a timeout to ensure we mark as initialized even if Firebase auth is slow
    const initTimeout = setTimeout(() => {
      if (!initialized) {
        console.log("Auth initialization timeout reached, marking as initialized");
        setInitialized(true);
        setLoading(false);
      }
    }, 5000);

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
      throw error; // Re-throw to allow handling in UI components
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

  // Implement email/password login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Process the user data
      await processUser(userCredential.user);
      
      console.log("Email/password login successful");
    } catch (error: any) {
      console.error("Email/password login error:", error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error("User not found. Please check your email or register a new account.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later.");
      } else {
        throw error; // Re-throw the original error if it's not one we can provide a better message for
      }
    }
  };

  // Implement signup with email/password
  const signup = async (email: string, password: string, name: string, role: UserRole, additionalData?: any): Promise<User> => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user data object
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
      
      // Save to MongoDB
      try {
        await createOrUpdateUser(userData);
      } catch (error) {
        console.error("Error saving user to MongoDB:", error);
        // Continue anyway - Firebase auth is established
      }
      
      // Process the user to update the context
      await processUser(firebaseUser);
      
      console.log("Signup successful");
      
      // Return the newly created user
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
      
      // Provide more user-friendly error messages
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
      // Update in MongoDB
      await createOrUpdateUser({
        uid: user.uid,
        role,
        isAdmin: role === "Admin"
      });
      
      // Update local state
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
