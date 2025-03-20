
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  // Format user data from Supabase
  const formatUserData = async (session: Session | null): Promise<User | null> => {
    if (!session?.user) return null;

    try {
      // Get user profile data from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      // Combine auth user and profile data
      return {
        uid: session.user.id,
        id: session.user.id,
        email: session.user.email || '',
        displayName: profile?.name || session.user.user_metadata?.name || null,
        name: profile?.name || session.user.user_metadata?.name || null,
        photoURL: profile?.photo_url || session.user.user_metadata?.avatar_url || null,
        role: (profile?.role as UserRole) || 'User',
        isAdmin: profile?.is_admin || false,
        employeeCode: profile?.employee_code || null,
        createdAt: profile?.created_at || new Date().toISOString(),
        phone: profile?.phone || null,
        instagramHandle: profile?.instagram_handle || null,
        facebookHandle: profile?.facebook_handle || null,
        verified: profile?.verified || false,
        city: profile?.city || null,
        country: profile?.country || null,
        niche: profile?.niche || null,
        followersCount: profile?.followers_count || null,
        bio: profile?.bio || null,
        businessName: profile?.business_name || null,
        ownerName: profile?.owner_name || null,
        businessCategory: profile?.business_category || null,
        website: profile?.website || null,
        gstNumber: profile?.gst_number || null,
        subscription: profile?.subscription || null,
        subscriptionId: profile?.subscription_id || null,
        subscriptionStatus: profile?.subscription_status || null,
        subscriptionPackage: profile?.subscription_package || null,
        customDashboardSections: profile?.custom_dashboard_sections || []
      };
    } catch (error) {
      console.error('Error formatting user data:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const userData = await formatUserData(session);
              setUser(userData);
              setSession(session);
              
              // Update last login time
              if (userData) {
                await supabase
                  .from('users')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', userData.uid);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
            }
          }
        );

        // THEN check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          const userData = await formatUserData(currentSession);
          setUser(userData);
          setSession(currentSession);
        }

        setLoading(false);
        setInitialized(true);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Authentication methods
  const login = async (email: string, password: string, employeeCode?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Set employee code if provided
      if (employeeCode && data.user) {
        await supabase
          .from('users')
          .update({ employee_code: employeeCode })
          .eq('id', data.user.id);
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      setLoading(true);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            ...additionalData
          },
        },
      });

      if (error) throw error;

      // The user profile will be automatically created via the trigger
      // but we'll update it with additional data
      if (data.user) {
        await supabase
          .from('users')
          .update({
            name,
            role,
            ...additionalData
          })
          .eq('id', data.user.id);
      }

      toast({
        title: "Signup successful",
        description: "Your account has been created. Please check your email for verification.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/');
      
      toast({
        title: "Logout successful",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Role management
  const updateUserRole = async (user: User, role: UserRole) => {
    try {
      if (!user.uid) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role,
          is_admin: role === 'Admin' ? true : user.isAdmin
        })
        .eq('id', user.uid);
      
      if (error) throw error;

      const updatedUser = {
        ...user,
        role,
        isAdmin: role === 'Admin' || user.isAdmin
      };
      
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserPermission = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      
      if (error) throw error;

      if (user && user.uid === userId) {
        setUser({
          ...user,
          isAdmin
        });
      }
      
      return { userId, isAdmin };
    } catch (error) {
      console.error('Error updating user permission:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user, // Alias for backward compatibility
        isAuthenticated: !!user,
        loading,
        initialized,
        userRole: user?.role || null,
        isAdmin: user?.isAdmin || false,
        login,
        loginWithGoogle,
        logout,
        signup,
        updateUserRole,
        updateUserPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
