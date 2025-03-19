
import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { createOrUpdateUser, fetchUserByUid, updateUserLoginTimestamp } from '@/api/mongoAPI';
import { createUserIfNotExists } from '@/features/auth/authService';
import Loading from '@/components/ui/loading';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Convert Firebase user to our User type and save to MongoDB
  const processUser = async (firebaseUser: FirebaseUser | null, additionalFields?: any) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // Create or update user in MongoDB with all profile fields
      const mongoUser = await createUserIfNotExists(firebaseUser, additionalFields);
      
      // Set the user in the context with proper type casting and all available fields
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: mongoUser?.isAdmin || false,
        role: (mongoUser?.role as UserRole) || 'User' as UserRole,
        employeeCode: mongoUser?.employeeCode || additionalFields?.employeeCode || null,
        // Include additional fields
        name: mongoUser?.name || firebaseUser.displayName,
        phone: mongoUser?.phone || additionalFields?.phone,
        instagramHandle: mongoUser?.instagramHandle || additionalFields?.instagramHandle,
        facebookHandle: mongoUser?.facebookHandle || additionalFields?.facebookHandle,
        niche: mongoUser?.niche || additionalFields?.niche,
        followersCount: mongoUser?.followersCount || additionalFields?.followersCount,
        bio: mongoUser?.bio || additionalFields?.bio,
        businessName: mongoUser?.businessName || additionalFields?.businessName,
        ownerName: mongoUser?.ownerName || additionalFields?.ownerName,
        businessCategory: mongoUser?.businessCategory || additionalFields?.businessCategory,
        website: mongoUser?.website || additionalFields?.website,
        gstNumber: mongoUser?.gstNumber || additionalFields?.gstNumber,
        city: mongoUser?.city || additionalFields?.city,
        country: mongoUser?.country || additionalFields?.country,
        verified: mongoUser?.verified || additionalFields?.verified || false,
        // Subscription-related fields
        subscription: mongoUser?.subscription,
        subscriptionStatus: mongoUser?.subscriptionStatus,
        subscriptionPackage: mongoUser?.subscriptionPackage,
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
        role: additionalFields?.role || 'User' as UserRole,
        employeeCode: additionalFields?.employeeCode || null,
        // Add any additional fields we have
        ...(additionalFields || {})
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Pass employee code for MongoDB storage
      await processUser(result.user, { employeeCode });
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw to allow handling in the UI
    }
  };

  // Implement role-specific signup with all profile fields
  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    additionalData: any = {}
  ): Promise<void> => {
    try {
      // Create the Firebase user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Process user with role and all the additional fields
      await processUser(result.user, {
        role,
        name,
        ...additionalData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Signup error:", error);
      throw error; // Re-throw to allow handling in the UI
    }
  };

  // Role-specific methods for the context
  const updateUserRole = async (userToUpdate: User): Promise<User> => {
    try {
      // Import dynamically to avoid circular dependencies
      const { updateUserRole: updateRole } = await import('../features/auth/userManagement');
      
      // Update the user role
      const updatedUser = await updateRole(userToUpdate);
      
      // Update local state if the updated user is the current user
      if (user && user.uid === updatedUser.uid) {
        setUser(updatedUser);
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  // Provide all context values
  const contextValue: AuthContextType = {
    user,
    currentUser: user, // Alias for compatibility
    isAuthenticated: !!user,
    loading,
    initialized,
    userRole: user?.role || null,
    isAdmin: user?.isAdmin || false,
    login,
    loginWithGoogle,
    logout: signOut,
    signup,
    updateUserRole
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
