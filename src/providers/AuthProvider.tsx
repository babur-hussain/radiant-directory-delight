import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  UserRole,
  AuthContextType,
  SessionData
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
  error: null,
  resetPassword: async () => null,
  updateUserProfile: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  // Effect to handle auth state changes and initialization
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // IMPORTANT: First get current session to set initial state
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session && isMounted) {
          console.log("Found existing session:", sessionData.session.user.id);
          setSession({
            accessToken: sessionData.session.access_token,
            refreshToken: sessionData.session.refresh_token,
            expiresAt: new Date(sessionData.session.expires_at!).toISOString(),
            providerToken: sessionData.session.provider_token || null,
            user: {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email || '',
              phone: sessionData.session.user.phone || '',
              userMetadata: sessionData.session.user.user_metadata || {},
              appMetadata: sessionData.session.user.app_metadata || {},
              aud: sessionData.session.user.aud || ''
            }
          });
          
          // Get additional user data
          try {
            const userData = await getCurrentUser();
            
            console.log("Fetched current user data:", userData?.id);
            
            // Special case for default admin
            if (sessionData.session.user?.email?.toLowerCase() === 'baburhussain660@gmail.com' && userData) {
              userData.isAdmin = true;
              userData.role = 'Admin';
            }
            
            if (isMounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            if (isMounted) {
              setUser(null);
            }
          }
        }
        
        // THEN set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, _session) => {
            console.log("Auth state changed:", event, _session?.user?.id);
            
            if (!isMounted) return;
            
            if (_session) {
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
                const userData = await getCurrentUser();
                
                // Special case for default admin
                if (_session.user?.email?.toLowerCase() === 'baburhussain660@gmail.com' && userData) {
                  userData.isAdmin = true;
                  userData.role = 'Admin';
                }
                
                if (isMounted) {
                  setUser(userData);
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
                if (isMounted) {
                  setUser(null);
                }
              }
            } else {
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
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
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
      const userData = await loginWithEmail(email, password, employeeCode);
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
      const isDefaultAdmin = email.toLowerCase() === 'baburhussain660@gmail.com';
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
      const userData = await getCurrentUser();
      
      // Special case for default admin
      if (userData?.email?.toLowerCase() === 'baburhussain660@gmail.com') {
        userData.isAdmin = true;
        userData.role = 'Admin';
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  // Context value
  const authContextValue: AuthContextType = {
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
    error: null,
    resetPassword,
    updateUserProfile: async (data) => {
      // Placeholder for updating user profile
      console.log("Update user profile with data:", data);
      return null;
    },
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
