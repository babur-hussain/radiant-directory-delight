
import { AuthContext } from "@/providers/AuthProvider";
import type { User, UserRole, AuthContextType } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

// Re-export what's needed for backward compatibility
export { AuthContext, useAuth };
export type { User, UserRole, AuthContextType };
