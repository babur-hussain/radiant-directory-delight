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
import { createUserIfNotExists, updateUserLogin } from '@/features/auth/authService';
import { connectToMongoDB } from '@/config/mongodb';
import Loading from '@/components/ui/loading';
import { createOrUpdateUser } from '@/api/services/userAPI';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  const processUser = async (firebaseUser: FirebaseUser | null, additionalFields?: any) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const connected = await connectToMongoDB();
      if (!connected) {
        console.error("Failed to connect to MongoDB in processUser");
        return;
      }

      const isDefaultAdmin = firebaseUser.email === 'baburhussain660@gmail.com';
      
      const userRole = isDefaultAdmin ? 'Admin' : (additionalFields?.role || 'User');
      
      const formattedUserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || additionalFields?.name,
        displayName: firebaseUser.displayName || additionalFields?.name,
        photoURL: firebaseUser.photoURL,
        isAdmin: isDefaultAdmin || additionalFields?.isAdmin,
        role: userRole,
        employeeCode: additionalFields?.employeeCode || null,
        phone: additionalFields?.phone,
        instagramHandle: additionalFields?.instagramHandle,
        facebookHandle: additionalFields?.facebookHandle,
        niche: additionalFields?.niche,
        followersCount: additionalFields?.followersCount,
        bio: additionalFields?.bio,
        businessName: additionalFields?.businessName,
        ownerName: additionalFields?.ownerName,
        businessCategory: additionalFields?.businessCategory,
        website: additionalFields?.website,
        gstNumber: additionalFields?.gstNumber,
        city: additionalFields?.city,
        country: additionalFields?.country,
        verified: additionalFields?.verified || false,
        createdAt: additionalFields?.createdAt || new Date(),
        lastLogin: new Date()
      };
      
      console.log("Directly storing user in MongoDB:", formattedUserData);
      const storedUser = await createOrUpdateUser(formattedUserData);
      
      const mongoUser = await createUserIfNotExists(firebaseUser, {
        ...additionalFields,
        isAdmin: isDefaultAdmin || additionalFields?.isAdmin,
        role: userRole
      });
      
      if (mongoUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: isDefaultAdmin || mongoUser.isAdmin,
          role: (mongoUser.role as UserRole) || (isDefaultAdmin ? 'Admin' : 'User'),
          employeeCode: mongoUser?.employeeCode || additionalFields?.employeeCode || null,
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
          subscription: mongoUser?.subscription,
          subscriptionStatus: mongoUser?.subscriptionStatus,
          subscriptionPackage: mongoUser?.subscriptionPackage,
        });
      } else {
        console.log("Using directly stored user as fallback:", storedUser);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin: isDefaultAdmin || storedUser?.isAdmin,
          role: (storedUser?.role as UserRole) || userRole,
          employeeCode: storedUser?.employeeCode || additionalFields?.employeeCode || null,
          name: storedUser?.name || firebaseUser.displayName,
          phone: storedUser?.phone || additionalFields?.phone,
          instagramHandle: storedUser?.instagramHandle || additionalFields?.instagramHandle,
          facebookHandle: storedUser?.facebookHandle || additionalFields?.facebookHandle,
          niche: storedUser?.niche || additionalFields?.niche,
          followersCount: storedUser?.followersCount || additionalFields?.followersCount,
          bio: storedUser?.bio || additionalFields?.bio,
          businessName: storedUser?.businessName || additionalFields?.businessName,
          ownerName: storedUser?.ownerName || additionalFields?.ownerName,
          businessCategory: storedUser?.businessCategory || additionalFields?.businessCategory,
          website: storedUser?.website || additionalFields?.website,
          gstNumber: storedUser?.gstNumber || additionalFields?.gstNumber,
          city: storedUser?.city || additionalFields?.city,
          country: storedUser?.country || additionalFields?.country,
          verified: storedUser?.verified || additionalFields?.verified || false,
          subscription: storedUser?.subscription,
          subscriptionStatus: storedUser?.subscriptionStatus,
          subscriptionPackage: storedUser?.subscriptionPackage,
          ...storedUser
        });
      }

      await updateUserLogin(firebaseUser.uid);
    } catch (error) {
      console.error("Error processing user:", error);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: firebaseUser.email === 'baburhussain660@gmail.com',
        role: firebaseUser.email === 'baburhussain660@gmail.com' ? 'Admin' : 'User',
        employeeCode: additionalFields?.employeeCode || null,
        ...(additionalFields || {})
      });
    }
  };

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      if (!initialized) {
        console.log("Auth initialization timeout reached, marking as initialized");
        setInitialized(true);
        setLoading(false);
      }
    }, 3000);

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

  const login = async (email: string, password: string, employeeCode?: string): Promise<void> => {
    try {
      console.log(`Attempting to login user: ${email}`);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await processUser(result.user, { employeeCode });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    additionalData: any = {}
  ): Promise<void> => {
    try {
      console.log(`Signing up new user: ${email} with role: ${role}`);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`Firebase user created: ${result.user.uid}`);
      
      await updateProfile(result.user, {
        displayName: name
      });
      console.log(`Display name set: ${name}`);
      
      const combinedData = {
        role,
        name,
        ...additionalData,
        createdAt: new Date().toISOString()
      };
      
      console.log(`Processing user with additional data:`, combinedData);
      await processUser(result.user, combinedData);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const updateUserRole = async (userToUpdate: User): Promise<User> => {
    try {
      const { updateUserRole: updateRole } = await import('../features/auth/userManagement');
      
      const updatedUser = await updateRole(userToUpdate);
      
      if (user && user.uid === updatedUser.uid) {
        setUser(updatedUser);
      }
      
      return updatedUser;
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
