
import React, { createContext } from "react";
import { AuthContextType, User, UserRole } from "../types/auth";
import AuthProvider from "../providers/AuthProvider";
import { useAuth } from "../hooks/useAuth";

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
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Re-export the provider for backward compatibility
export { AuthProvider };

// Re-export the useAuth hook for backward compatibility
export { useAuth };

// Re-export types for backward compatibility
export type { User, UserRole };
