
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, AuthContextType } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  error: null,
  signIn: () => Promise.resolve(null),
  signOut: () => Promise.resolve(null),
  signUp: () => Promise.resolve(null),
  resetPassword: () => Promise.resolve(null),
  updateUser: () => Promise.resolve(null),
  refreshUser: () => Promise.resolve(null),
  refreshUserData: () => Promise.resolve(null),
  login: () => Promise.resolve(null),
  logout: () => Promise.resolve(null),
  loginWithGoogle: () => Promise.resolve(null),
  signup: () => Promise.resolve(null)
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    console.info('Initializing auth state...');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.info('Auth state changed: INITIAL_SESSION', data.session);
        
        if (data.session) {
          const userData = data.session.user;
          setUser({
            id: userData.id,
            email: userData.email,
            ...userData.user_metadata,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Call initialize
    initializeAuth();
    
    // Set up subscription for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.info('Auth state changed:', event, session);
        
        if (session) {
          const userData = session.user;
          setUser({
            id: userData.id,
            email: userData.email,
            ...userData.user_metadata,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setInitialized(true);
        setLoading(false);
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, data?: any) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: data || {},
        },
      });

      if (error) {
        throw error;
      }

      return authData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUser = async (data: Partial<User>) => {
    setLoading(true);
    try {
      const { data: userData, error } = await supabase.auth.updateUser({
        data,
      });

      if (error) {
        throw error;
      }

      if (userData.user) {
        setUser({
          id: userData.user.id,
          email: userData.user.email,
          ...userData.user.user_metadata,
        });
      }

      return userData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          ...data.user.user_metadata,
        });
        setIsAuthenticated(true);
      }
      
      return data;
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Aliases for backward compatibility
  const login = signIn;
  const logout = signOut;
  const refreshUserData = refreshUser;
  const signup = (email: string, password: string, name: string, role: any, additionalData?: any) => {
    const userData = {
      name,
      role,
      ...additionalData,
    };
    return signUp(email, password, userData);
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const contextValue: AuthContextType = {
    user,
    currentUser: user,
    isAuthenticated,
    loading,
    initialized,
    error,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateUser,
    refreshUser,
    refreshUserData,
    login,
    logout,
    loginWithGoogle,
    signup,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
