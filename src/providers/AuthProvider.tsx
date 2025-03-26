
import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  UserRole,
  AuthContextType,
  SessionData
} from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Define AuthProviderProps
interface AuthProviderProps {
  children: ReactNode;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  // Function to get current user data
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      // Fetch user from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) return null;
      
      return {
        uid: data.id,
        id: data.id,
        email: data.email || '',
        displayName: data.name || '',
        name: data.name || '',
        role: data.role as UserRole || 'user',
        isAdmin: data.is_admin || false,
        photoURL: data.photo_url || '',
        employeeCode: data.employee_code || '',
        createdAt: data.created_at || '',
        lastLogin: data.last_login || '',
        phone: data.phone || '',
        instagramHandle: data.instagram_handle || '',
        facebookHandle: data.facebook_handle || '',
        verified: data.verified || false,
        city: data.city || '',
        country: data.country || '',
        niche: data.niche || '',
        followersCount: data.followers_count || '',
        bio: data.bio || '',
        businessName: data.business_name || '',
        ownerName: data.owner_name || '',
        businessCategory: data.business_category || '',
        website: data.website || '',
        gstNumber: data.gst_number || ''
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  // Mock functions needed by the context
  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };
  
  const signupWithEmail = async (email: string, password: string, userData?: Partial<User>): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name,
            role: userData?.role || 'user'
          }
        }
      });
      
      if (error) throw error;
      
      return await getCurrentUser();
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    }
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error("Google login error:", error);
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
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
              appMetadata: sessionData.session.user.app_metadata || {}
            }
          });
          
          try {
            const currentUserData = await getCurrentUser();
            
            console.log("Fetched current user data:", currentUserData?.id);
            
            if (sessionData.session.user?.email?.toLowerCase() === 'baburhussain660@gmail.com' && currentUserData) {
              const updatedUserData = {
                ...currentUserData,
                isAdmin: true,
                role: 'admin' as UserRole
              };
              
              if (isMounted) {
                setUser(updatedUserData);
              }
            } else if (currentUserData && isMounted) {
              setUser(currentUserData);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            if (isMounted) {
              setUser(null);
            }
          }
        }
        
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
                  appMetadata: _session.user.app_metadata || {}
                }
              });
              
              try {
                const currentUserData = await getCurrentUser();
                
                if (_session.user?.email?.toLowerCase() === 'baburhussain660@gmail.com' && currentUserData) {
                  const updatedUserData = {
                    ...currentUserData,
                    isAdmin: true,
                    role: 'admin' as UserRole
                  };
                  
                  if (isMounted) {
                    setUser(updatedUserData);
                  }
                } else if (currentUserData && isMounted) {
                  setUser(currentUserData);
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

  const refreshUserData = async (): Promise<User | null> => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
      }
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<User>): Promise<User | null> => {
    try {
      if (!user) throw new Error("No user logged in");
      
      // Update Supabase user data
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          photo_url: profile.photoURL,
          phone: profile.phone,
          business_name: profile.businessName,
          business_category: profile.businessCategory,
          email: profile.email,
          // Add other fields as needed
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      return refreshUserData();
    } catch (error) {
      console.error("Error updating user profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated: !!user,
        loading,
        initialized,
        login: loginWithEmail,
        loginWithGoogle,
        signup: signupWithEmail,
        logout,
        refreshUserData,
        error: null,
        resetPassword,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
