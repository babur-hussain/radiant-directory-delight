import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { toast } from "@/hooks/use-toast";
import { User, UserRole, AuthContextType } from "../types/auth";
import { 
  getRoleKey, 
  getAdminKey, 
  initializeDefaultAdmin, 
  saveUserToAllUsersList 
} from "../features/auth/authStorage";
import { 
  login, 
  loginWithGoogle, 
  signup, 
  logoutUser 
} from "../features/auth/authService";
import { 
  updateUserRole as updateRole, 
  updateUserPermission as updatePermission 
} from "../features/auth/userManagement";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

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

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    initializeDefaultAdmin();
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const roleKey = getRoleKey(firebaseUser.uid);
        const userRole = localStorage.getItem(roleKey) as UserRole || null;
        
        const adminKey = getAdminKey(firebaseUser.uid);
        const isAdmin = localStorage.getItem(adminKey) === 'true';
        
        const isDefaultAdmin = firebaseUser.email === "baburhussain660@gmail.com";
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: isDefaultAdmin ? 'Admin' : userRole,
          photoURL: firebaseUser.photoURL,
          isAdmin: isDefaultAdmin || isAdmin
        };
        
        try {
          const userDoc = doc(db, "users", firebaseUser.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (!userSnapshot.exists()) {
            console.log("User not found in Firestore, creating:", firebaseUser.uid);
            await setDoc(userDoc, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: isDefaultAdmin ? 'Admin' : userRole,
              photoURL: firebaseUser.photoURL,
              isAdmin: isDefaultAdmin || isAdmin,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
          } else {
            await setDoc(userDoc, {
              lastLogin: serverTimestamp()
            }, { merge: true });
          }
        } catch (error) {
          console.error("Error saving/updating user in Firestore:", error);
        }
        
        saveUserToAllUsersList(userData);
        console.log("Auth state changed: User logged in", userData);
        
        setUser(userData);
      } else {
        setUser(null);
        console.log("Auth state changed: User logged out");
      }
      setLoading(false);
      setInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
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

  const handleLoginWithGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
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

  const handleSignup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      const firebaseUser = await signup(email, password, name, role);
      
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: name || firebaseUser.email?.split('@')[0] || 'User',
          role: role,
          photoURL: null,
          isAdmin: false
        };
        
        saveUserToAllUsersList(userData);
        console.log("Saving new registered user to all users list:", userData);
      }
      
      toast({
        title: "Registration successful",
        description: `You have successfully registered as a ${role}.`,
      });
      
      return firebaseUser;
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

  const handleLogout = async () => {
    try {
      await logoutUser();
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

  const handleUpdateUserRole = async (role: UserRole) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const updatedUser = await updateRole(user, role);
      setUser(updatedUser);
      
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

  const handleUpdateUserPermission = async (userId: string, isAdmin: boolean) => {
    try {
      await updatePermission(userId, isAdmin);
      
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
        login: handleLogin,
        loginWithGoogle: handleLoginWithGoogle,
        signup: handleSignup,
        logout: handleLogout,
        updateUserRole: handleUpdateUserRole,
        updateUserPermission: handleUpdateUserPermission,
        loading,
        initialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

export default AuthProvider;
