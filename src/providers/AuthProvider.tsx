
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { toast } from "@/hooks/use-toast";
import { User, UserRole, AuthContextType } from "../types/auth";
import { 
  getRoleKey, 
  getAdminKey, 
  initializeDefaultAdmin,
  saveUserToAllUsersList
} from "../utils/authStorage";

// Create the auth context with default values
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUserRole: async () => {},
  updateUserPermission: async () => {},
  loading: true,
  initialized: false
};

// Create the auth context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Firebase authentication implementation
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize default admin on first load
  useEffect(() => {
    initializeDefaultAdmin();
  }, []);
  
  // Set up auth state listener on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get role from localStorage
        const roleKey = getRoleKey(firebaseUser.uid);
        const userRole = localStorage.getItem(roleKey) as UserRole || null;
        
        // Check if user is admin
        const adminKey = getAdminKey(firebaseUser.uid);
        const isAdmin = localStorage.getItem(adminKey) === 'true';
        
        // For the default admin account
        const isDefaultAdmin = firebaseUser.email === "baburhussain660@gmail.com";
        
        // Create user object from Firebase user
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: isDefaultAdmin ? 'Admin' : userRole,
          photoURL: firebaseUser.photoURL,
          isAdmin: isDefaultAdmin || isAdmin
        };
        
        // Store user in all users list for admin panel
        saveUserToAllUsersList(userData);
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      // Handle specific error codes
      let errorMessage = "Please check your credentials and try again.";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for authentication. Please try again later or contact support.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many unsuccessful login attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // No need to save role here as it's already handled in the signup process
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Google login error:", error.code, error.message);
      
      let errorMessage = "There was an error signing in with Google.";
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for authentication. Please try from an authorized domain or contact support.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Multiple popup requests were made. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "The authentication popup was blocked by your browser. Please allow popups for this website and try again.";
      }
      
      toast({
        title: "Google login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: name
        });
      }
      
      // Store role information in localStorage
      if (role && firebaseUser) {
        localStorage.setItem(getRoleKey(firebaseUser.uid), role as string);
      }
      
      toast({
        title: "Registration successful",
        description: `You have successfully registered as a ${role}.`,
      });
    } catch (error: any) {
      console.error("Registration error:", error.code, error.message);
      
      let errorMessage = "There was an error processing your registration.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for authentication. Please try from an authorized domain.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (role: UserRole) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Store the updated role in localStorage
      localStorage.setItem(getRoleKey(user.id), role as string);
      
      // Update all users list
      const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex >= 0) {
        allUsers[userIndex].role = role;
        localStorage.setItem('all_users_data', JSON.stringify(allUsers));
      }
      
      // Update the user object in state
      setUser({
        ...user,
        role
      });
      
      toast({
        title: "Role updated",
        description: `Your account type has been updated to ${role}.`,
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Role update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your role.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const updateUserPermission = async (userId: string, isAdmin: boolean) => {
    try {
      // Store the admin status in localStorage
      localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
      
      // Update all users list
      const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.id === userId);
      
      if (userIndex >= 0) {
        allUsers[userIndex].isAdmin = isAdmin;
        localStorage.setItem('all_users_data', JSON.stringify(allUsers));
      }
      
      // If the user being updated is the current user, update the state
      if (user && user.id === userId) {
        setUser({
          ...user,
          isAdmin
        });
      }
      
      toast({
        title: "Permission updated",
        description: `Admin permission ${isAdmin ? 'granted' : 'removed'}.`,
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Permission update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating permissions.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUserRole,
        updateUserPermission,
        loading,
        initialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export provider for use in App.tsx
export default AuthProvider;
