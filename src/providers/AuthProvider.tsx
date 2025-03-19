
import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AuthContextType } from '@/types/auth';
import { createOrUpdateUser, fetchUserByUid, updateUserLoginTimestamp } from '@/api/mongoAPI';
import Loading from '@/components/ui/loading';

// Define the AuthUser type locally since it's not exported from @/types/auth
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  role: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Convert Firebase user to our AuthUser type and save to MongoDB
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
          role: "user",
          isAdmin: false,
          createdAt: new Date()
        });
      } else {
        // Just update the last login time
        await updateUserLoginTimestamp(firebaseUser.uid);
      }
      
      // Set the user in the context
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: mongoUser.isAdmin || false,
        role: mongoUser.role || 'user'
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
        role: 'user'
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
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    loginWithGoogle,
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
