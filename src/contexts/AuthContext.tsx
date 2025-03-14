
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { toast } from "@/hooks/use-toast";

// Define types for our auth context
export type UserRole = "Business" | "Influencer" | null;

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key for storing user roles in localStorage
const getRoleKey = (userId: string) => `user_role_${userId}`;

// Firebase authentication implementation
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Set up auth state listener on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get role from localStorage
        const roleKey = getRoleKey(firebaseUser.uid);
        const userRole = localStorage.getItem(roleKey) as UserRole || null;
        
        // Create user object from Firebase user
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: userRole,
          photoURL: firebaseUser.photoURL
        };
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
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
      const result = await signInWithPopup(auth, googleProvider);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
