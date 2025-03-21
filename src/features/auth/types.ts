
// Import the User type directly from the types file
import { User, UserRole, AuthContextType, UserSubscription, SubscriptionStatus, isUserSubscription } from "../../types/auth";

// Re-export the types from the main types file for better organization
export type { User, UserRole, AuthContextType, UserSubscription, SubscriptionStatus } from "../../types/auth";
export { isUserSubscription } from "../../types/auth";

// Define any additional auth-related types if needed
export interface AuthResponse {
  user: User | null;
  success: boolean;
  error?: string;
}
