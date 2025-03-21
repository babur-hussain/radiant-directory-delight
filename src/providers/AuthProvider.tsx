
import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  UserRole,
  AuthContextType,
  SessionData,
  DEFAULT_ADMIN_EMAIL
} from '@/types/auth';
import {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout as authLogout,
  getCurrentUser
} from '@/features/auth/authService';
import { toast } from '@/hooks/use-toast';

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  login: async () => null,
  loginWithGoogle: async () => {},
  signup: async () => null,
  logout: async () => {},
  refreshUserData: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  // Effect to handle auth state changes and initialization
  useEffect(() => {
    console.log("Auth provider initializing...");
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, _session) => {
            console.log("Auth state changed:", event, "Session:", _session ? "exists" : "null");
            
            if (!isMounted) return;
            
            if (_session) {
              console.log("Session user ID:", _session.user.id);
              setSession({
                accessToken: _session.access_token,
                refreshToken: _session.refresh_token,
                expiresAt: new Date(_session.expires_at!).toISOString(),
                providerToken: _session.provider_token || null,
                user: {
                  id: _session.user.id,
                  email: _session.user.email || '',
                  phone: _session.user.phone || '',
                  userMetadata: _session.user.user_metadata || {},
                  appMetadata: _session.user.app_metadata || {},
                  aud: _session.user.aud || ''
                }
              });
              
              // Get additional user data
              try {
                console.log("Fetching user data for ID:", _session.user.id);
                const userData = await getCurrentUser();
                console.log("User data fetched:", userData ? "success" : "null");
                
                // Special case for default admin
                if (_session.user?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && userData) {
                  userData.isAdmin = true;
                  userData.role = 'Admin';
                  console.log("Admin user detected, forcing admin role");
                }
                
                if (isMounted) {
                  setUser(userData);
                  console.log("User state set:", userData ? userData.email : "null");
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
                if (isMounted) {
                  setUser(null);
                }
              }
            } else {
              console.log("No session in auth state change");
              if (isMounted) {
                setSession(null);
                setUser(null);
              }
            }
            
            if (isMounted) {
              setLoading(false);
            }
          }
        );
        
        // Get current session
        console.log("Checking for existing session...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession && isMounted) {
          console.log("Existing session found for user:", currentSession.user.email);
          setSession({
            accessToken: currentSession.access_token,
            refreshToken: currentSession.refresh_token,
            expiresAt: new Date(currentSession.expires_at!).toISOString(),
            providerToken: currentSession.provider_token || null,
            user: {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              phone: currentSession.user.phone || '',
              userMetadata: currentSession.user.user_metadata || {},
              appMetadata: currentSession.user.app_metadata || {},
              aud: currentSession.user.aud || ''
            }
          });
          
          // Get additional user data
          try {
            console.log("Fetching user data for existing session");
            const userData = await getCurrentUser();
            console.log("User data for existing session:", userData ? userData.email : "null");
            
            // Special case for default admin
            if (currentSession.user?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && userData) {
              userData.isAdmin = true;
              userData.role = 'Admin';
              console.log("Setting admin privileges for default admin account");
            }
            
            if (isMounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error("Error fetching existing user data:", error);
            if (isMounted) {
              setUser(null);
            }
          }
        } else {
          console.log("No existing session found");
        }
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log("Auth provider initialized");
        }
        
        // Cleanup function
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email: string, password: string, employeeCode?: string): Promise<User | null> => {
    try {
      setLoading(true);
      console.log("Attempting login for:", email);
      const userData = await loginWithEmail(email, password, employeeCode);
      console.log("Login successful, user data:", userData ? userData.email : "null");
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle email not confirmed error
      if (error instanceof Error && error.message.includes("Email not confirmed")) {
        // Rethrow to let form handle UI
        throw error;
      }
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ): Promise<User | null> => {
    try {
      setLoading(true);
      
      // Check if this is the admin email
      const isDefaultAdmin = email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
      if (isDefaultAdmin) {
        console.log("Registering default admin account");
        role = 'Admin';
        additionalData = {
          ...additionalData,
          isAdmin: true
        };
      }
      
      const userData = await signupWithEmail(email, password, name, role, additionalData);
      
      // Don't set the user here as we want to make the user confirm their email
      // unless we're in development mode and bypassing email confirmation
      if (process.env.NODE_ENV === 'development' || isDefaultAdmin) {
        console.log("Setting user immediately after signup (dev mode or admin)");
        setUser(userData);
      }
      
      return userData;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logoutUser = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("Logging out user");
      await authLogout();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("Initiating Google login");
      await loginWithGoogle();
      // Auth state handler will update user state
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data function
  const refreshUserData = async (): Promise<User | null> => {
    try {
      console.log("Refreshing user data");
      const userData = await getCurrentUser();
      
      // Special case for default admin
      if (userData?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        userData.isAdmin = true;
        userData.role = 'Admin';
        console.log("Refreshed user data with admin privileges");
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  // Context value
  const value: AuthContextType = {
    currentUser: user,
    user,
    isAuthenticated: !!user,
    loading,
    initialized,
    login,
    loginWithGoogle: handleGoogleLogin,
    signup,
    logout: logoutUser,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
