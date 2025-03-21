
// Re-export the provider and context from our main implementation
import { AuthProvider, AuthContext } from "@/hooks/useAuth";
import { User, UserRole, AuthContextType } from "@/types/auth";

// Re-export what's needed for backward compatibility
export { AuthProvider, AuthContext, User, UserRole, AuthContextType };
export { useAuth } from "@/hooks/useAuth";
