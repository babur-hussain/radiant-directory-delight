
import React, { createContext, useContext, useState, useEffect } from "react";

// Define types for our auth context
export type UserRole = "Business" | "Influencer" | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication functionality (would be replaced with a real auth system)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // This is a mock implementation - would be replaced with actual API call
    // For demo purposes, we'll accept any credentials
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role: localStorage.getItem(`role_${email}`) as UserRole || null
    };
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    return Promise.resolve();
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    // This is a mock implementation - would be replaced with actual API call
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role
    };
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem(`role_${email}`, role as string);
    
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout
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
