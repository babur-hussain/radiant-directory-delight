
import React from "react";
import { AuthContextType, User, UserRole } from "../types/auth";
import AuthProvider, { AuthContext } from "../providers/AuthProvider";
import { useAuth } from "../hooks/useAuth";

// Re-export the provider and context
export { AuthProvider, AuthContext };

// Re-export the useAuth hook for backward compatibility
export { useAuth };

// Re-export types for backward compatibility
export type { User, UserRole };
