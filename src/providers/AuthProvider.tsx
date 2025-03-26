
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType, SessionData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { convertCapitalizedRole } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Import auth functions instead of trying to use missing exports
import { handleAuthStateChange, syncSupabaseUser } from '@/features/auth/authService';

// Create auth context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  error: null,
  login: async () => null,
  loginWithGoogle: async () => null,
  signup: async () => null,
  logout: async () => {},
  resetPassword: async () => false,
  updateUserProfile: async () => null,
  refreshUserData: async () => {},
});

interface AuthProviderComponentProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderComponentProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [session, setSession] = useState<SessionData>({
    user: null,
    isAuthenticated: false,
    accessToken: '',
    refreshToken: '',
    expiresAt: '',
    providerToken: null
  });

  // Initialize auth state
  useEffect(() => {
    console.info('Initializing auth state...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sessionData) => {
        console.info('Auth state changed:', event, sessionData?.user?.id);
        
        if (sessionData?.user) {
          try {
            const userData = await syncSupabaseUser(sessionData.user);
            
            if (userData) {
              setUser(userData);
              setSession({
                user: userData,
                isAuthenticated: true,
                accessToken: sessionData.access_token,
                refreshToken: sessionData.refresh_token,
                expiresAt: sessionData.expires_at?.toString() || '',
                providerToken: sessionData.provider_token
              });
            }
          } catch (err) {
            console.error('Error syncing user data:', err);
            setError(err instanceof Error ? err : new Error('Failed to sync user data'));
          }
        } else {
          setUser(null);
          setSession({
            user: null,
            isAuthenticated: false,
            accessToken: '',
            refreshToken: '',
            expiresAt: '',
            providerToken: null
          });
        }
        
        setLoading(false);
        setInitialized(true);
      });
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.info('Found existing session:', currentSession?.user?.id);
      
      if (currentSession?.user) {
        syncSupabaseUser(currentSession.user).then(userData => {
          if (userData) {
            setUser(userData);
            setSession({
              user: userData,
              isAuthenticated: true,
              accessToken: currentSession.access_token,
              refreshToken: currentSession.refresh_token,
              expiresAt: currentSession.expires_at?.toString() || '',
              providerToken: currentSession.provider_token
            });
          }
          
          setLoading(false);
          setInitialized(true);
        }).catch(err => {
          console.error('Error getting current user:', err);
          setError(err instanceof Error ? err : new Error('Failed to get current user'));
          setLoading(false);
          setInitialized(true);
        });
      } else {
        setLoading(false);
        setInitialized(true);
      }
    }).catch(err => {
      console.error('Error initializing auth:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
      setLoading(false);
      setInitialized(true);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle sign up
  const signup = async (
    email: string, 
    password: string, 
    userData?: Partial<User>
  ): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name || email.split('@')[0],
            role: userData?.role || 'user',
            ...userData
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userObj = {
          id: data.user.id,
          email: data.user.email || '',
          displayName: userData?.name || email.split('@')[0],
          name: userData?.name || email.split('@')[0],
          role: userData?.role || 'user',
          isAdmin: (userData?.role || 'user') === 'admin',
          ...userData
        };
        
        return userObj;
      }
      
      return null;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    }
  };
  
  // Handle login
  const login = async (
    email: string, 
    password: string, 
    employeeCode?: string
  ): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData = await syncSupabaseUser(data.user);
        return userData;
      }
      
      return null;
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err instanceof Error ? err : new Error('Failed to log in'));
      throw err;
    }
  };
  
  // Handle login with Google
  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // For OAuth, we return null here as the auth flow will be completed in the redirect
      return null;
    } catch (err) {
      console.error('Error logging in with Google:', err);
      setError(err instanceof Error ? err : new Error('Failed to log in with Google'));
      throw err;
    }
  };
  
  // Handle logout
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setSession({
        user: null,
        isAuthenticated: false,
        accessToken: '',
        refreshToken: '',
        expiresAt: '',
        providerToken: null
      });
    } catch (err) {
      console.error('Error logging out:', err);
      setError(err instanceof Error ? err : new Error('Failed to log out'));
      throw err;
    }
  };
  
  // Handle password reset
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      throw err;
    }
  };
  
  // Handle user profile update
  const updateUserProfile = async (data: Partial<User>): Promise<User | null> => {
    try {
      if (!user?.id) return null;
      
      // Update user metadata in Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name || user.name,
          role: data.role || user.role,
          ...data
        }
      });
      
      if (error) throw error;
      
      // Also update the user in our users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: data.name || user.name,
          role: data.role || user.role,
          ...data
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.warn('Error updating user in users table:', updateError);
      }
      
      // Update the local user state
      const updatedUser = {
        ...user,
        ...data
      };
      
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user profile'));
      throw err;
    }
  };
  
  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user) {
        const userData = await syncSupabaseUser(data.user);
        
        if (userData) {
          setUser(userData);
        }
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh user data'));
    }
  };
  
  const contextValue: AuthContextType = {
    user,
    currentUser: user,
    isAuthenticated: !!user,
    loading,
    initialized,
    error,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserData
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
