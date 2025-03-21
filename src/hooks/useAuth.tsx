import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { createOrUpdateUser } from '@/api/services/userAPI';
import { mapUserData } from '@/features/auth/authService';
import { toast } from './use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Computed state
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  // Initialize auth state
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        
        if (session && session.user) {
          try {
            // Fetch user profile from users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError && userError.code !== 'PGRST116') {
              console.error('Error fetching user data:', userError);
            }
            
            // Map the user data to our User model
            const mappedUser: User = userData 
              ? mapUserData({ ...userData, uid: session.user.id })
              : {
                  uid: session.user.id,
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || null,
                  displayName: session.user.user_metadata?.name || '',
                  photoURL: null,
                  isAdmin: session.user.user_metadata?.role === 'Admin',
                  role: session.user.user_metadata?.role as UserRole || 'User',
                };
            
            setUser(mappedUser);
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching initial user data:', userError);
        }
        
        // Map the user data to our User model
        const mappedUser: User = userData 
          ? mapUserData({ ...userData, uid: session.user.id })
          : {
              uid: session.user.id,
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || null,
              displayName: session.user.user_metadata?.name || '',
              photoURL: null,
              isAdmin: session.user.user_metadata?.role === 'Admin',
              role: session.user.user_metadata?.role as UserRole || 'User',
            };
        
        setUser(mappedUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string, employeeCode?: string): Promise<void> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // If employee code is provided, update the user data
      if (employeeCode && data.user) {
        await createOrUpdateUser({
          uid: data.user.id,
          employeeCode,
        });
      }
      
      // Redirect will happen automatically via auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to login. Please check your credentials.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
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
      
      // Redirect will be handled by OAuth provider
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with Google.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Signup function
  const signup = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole,
    additionalData: any = {}
  ): Promise<void> => {
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
            role: role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('User registration failed.');
      }
      
      // Create a full user profile with all the additional data
      const userData: Partial<User> & { uid: string } = {
        uid: data.user.id,
        id: data.user.id,
        email: data.user.email!,
        displayName,
        name: displayName,
        role,
        isAdmin: role === 'Admin',
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        // Merge all the additional data
        ...additionalData,
      };
      
      // Save the user data to our users table
      await createOrUpdateUser(userData);
      
      // Navigate based on role after successful signup
      if (role === 'Business' || role === 'Influencer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear user state and navigate to home
      setUser(null);
      navigate('/');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Update user data
  const updateUserData = async (updatedData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user is logged in');
    }
    
    setLoading(true);
    
    try {
      // Update user metadata in auth
      if (updatedData.displayName || updatedData.name || updatedData.role) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            name: updatedData.displayName || updatedData.name || user.displayName,
            role: updatedData.role || user.role,
          },
        });
        
        if (metadataError) {
          throw metadataError;
        }
      }
      
      // Update user profile in our users table
      const userData = {
        ...updatedData,
        uid: user.uid,
      };
      
      await createOrUpdateUser(userData);
      
      // Update local user state
      setUser((prevUser) => prevUser ? { ...prevUser, ...updatedData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Update user data error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Create context value
  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateUserData,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
