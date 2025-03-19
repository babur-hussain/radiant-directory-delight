
import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
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
        mongoUser = await createOrUpdateUser({
          ...userData,
          role: "User" as UserRole, // Cast as UserRole to satisfy type constraint
          isAdmin: false,
          createdAt: new Date()
        });
      } else {
        // Just update the last login time
        await updateUserLoginTimestamp(firebaseUser.uid);
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
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processUser(result.user);
      return true;
    } catch (error) {
      console.error("Google sign-in error:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Return void instead of boolean to match interface
    } catch (error) {
      console.error("Sign out error:", error);
      // Return void instead of boolean to match interface
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    loginWithGoogle, // Make sure this matches the expected property name
    signOut
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" message="Loading authentication..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
