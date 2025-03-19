
import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser 
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
  const processUser = async (firebaseUser: FirebaseUser | null, employeeCode?: string) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // First, check if user exists in MongoDB
      let mongoUser = null;
      try {
        mongoUser = await fetchUserByUid(firebaseUser.uid);
      } catch (error) {
        console.error("Error fetching user from MongoDB:", error);
        // Continue with default user object
      }
      
      // Prepare the user data
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        lastLogin: new Date(),
        // Only add employeeCode if it exists and we don't already have one
        ...(employeeCode ? { employeeCode } : {})
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
      } else if (employeeCode && !mongoUser.employeeCode) {
        // If we have a new employee code and the user doesn't have one yet, update it
        try {
          mongoUser = await createOrUpdateUser({
            ...mongoUser,
            employeeCode
          });
        } catch (error) {
          console.error("Error updating employee code:", error);
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
        role: (mongoUser.role as UserRole) || 'User' as UserRole,
        employeeCode: mongoUser.employeeCode || employeeCode || null
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
        role: 'User' as UserRole,
        employeeCode: employeeCode || null
      });
    }
  };

  useEffect(() => {
    // Set a shorter timeout to ensure we mark as initialized even if Firebase auth is slow
    const initTimeout = setTimeout(() => {
      if (!initialized) {
        console.log("Auth initialization timeout reached, marking as initialized");
        setInitialized(true);
        setLoading(false);
      }
    }, 3000); // Shorter timeout

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
      throw error; // Re-throw to allow handling in the UI
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error; // Re-throw to allow handling in the UI
    }
  };

  // Implement proper email/password login method with employee code
  const login = async (email: string, password: string, employeeCode?: string): Promise<void> => {
    try {
      console.log(`Attempting to login with email: ${email}`);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await processUser(result.user, employeeCode);
    } catch (error) {
      console.error("Email/password login error:", error);
      throw error; // Re-throw to allow handling in the UI
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
    initialized,
    // Add missing properties from AuthContextType
    userRole: user?.role || null,
    isAdmin: user?.isAdmin || false,
    // We can leave these as optional properties according to the interface
    // signup, updateUserRole, and updateUserPermission are marked as optional with ?
  };

  // Don't show loading screen - the header will handle this now
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
