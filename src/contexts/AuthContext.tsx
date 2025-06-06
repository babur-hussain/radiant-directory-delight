
import React from 'react';
// Re-export the provider and context from our main implementation
import { AuthProvider, AuthContext } from "@/providers/AuthProvider";
import type { User, UserRole, AuthContextType } from "@/types/auth";

// Re-export what's needed for backward compatibility
export { AuthProvider, AuthContext };
export type { User, UserRole, AuthContextType };
export { useAuth } from "@/hooks/useAuth";
