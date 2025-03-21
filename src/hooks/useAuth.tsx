
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { AuthContextType, User as AppUser, UserRole } from '@/types/auth';

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  uid: string | null;
  id: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  initialized: false,
  userRole: null,
  isAdmin: false,
  
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  signup: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            // Fetch user data to get role
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData) {
              const appUser: AppUser = {
                uid: session.user.id,
                id: session.user.id,
                email: session.user.email,
                displayName: userData.name || null,
                name: userData.name || null,
                photoURL: userData.photo_url || null,
                role: (userData.role as UserRole) || 'User',
                isAdmin: userData.is_admin || false,
                employeeCode: userData.employee_code || null,
                createdAt: userData.created_at || new Date().toISOString(),
                phone: userData.phone || null,
                instagramHandle: userData.instagram_handle || null,
                facebookHandle: userData.facebook_handle || null,
                verified: userData.verified || false,
                city: userData.city || null,
                country: userData.country || null,
                fullName: userData.name || null,
                niche: userData.niche || null,
                followersCount: userData.followers_count || null,
                bio: userData.bio || null,
                businessName: userData.business_name || null,
                ownerName: userData.owner_name || null,
                businessCategory: userData.business_category || null,
                website: userData.website || null,
                gstNumber: userData.gst_number || null,
              };
              
              setUser(appUser);
              setUserRole(appUser.role);
              setIsAdmin(appUser.isAdmin);
            } else {
              // Create minimal user if no profile data exists
              setUser({
                uid: session.user.id,
                id: session.user.id,
                email: session.user.email,
                displayName: null,
                name: null,
                photoURL: null,
                role: 'User',
                isAdmin: false
              });
              setUserRole('User');
              setIsAdmin(false);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            // Fallback user with minimal data
            setUser({
              uid: session.user.id,
              id: session.user.id,
              email: session.user.email,
              displayName: null,
              name: null,
              photoURL: null,
              role: 'User',
              isAdmin: false
            });
            setUserRole('User');
            setIsAdmin(false);
          }
          
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
          setUserRole(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
        setInitialized(true);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          // Fetch user data to get role
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            const appUser: AppUser = {
              uid: session.user.id,
              id: session.user.id,
              email: session.user.email,
              displayName: userData.name || null,
              name: userData.name || null,
              photoURL: userData.photo_url || null,
              role: (userData.role as UserRole) || 'User',
              isAdmin: userData.is_admin || false,
              employeeCode: userData.employee_code || null,
              createdAt: userData.created_at || new Date().toISOString(),
              phone: userData.phone || null,
              instagramHandle: userData.instagram_handle || null,
              facebookHandle: userData.facebook_handle || null,
              verified: userData.verified || false,
              city: userData.city || null,
              country: userData.country || null,
              fullName: userData.name || null,
              niche: userData.niche || null,
              followersCount: userData.followers_count || null,
              bio: userData.bio || null,
              businessName: userData.business_name || null,
              ownerName: userData.owner_name || null,
              businessCategory: userData.business_category || null,
              website: userData.website || null,
              gstNumber: userData.gst_number || null,
            };
            
            setUser(appUser);
            setUserRole(appUser.role);
            setIsAdmin(appUser.isAdmin);
          } else {
            // Create minimal user if no profile data exists
            setUser({
              uid: session.user.id,
              id: session.user.id,
              email: session.user.email,
              displayName: null,
              name: null,
              photoURL: null,
              role: 'User',
              isAdmin: false
            });
            setUserRole('User');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Fallback user with minimal data
          setUser({
            uid: session.user.id,
            id: session.user.id,
            email: session.user.email,
            displayName: null,
            name: null,
            photoURL: null,
            role: 'User',
            isAdmin: false
          });
          setUserRole('User');
          setIsAdmin(false);
        }
        
        setSession(session);
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, employeeCode?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      // Set employee code if provided
      if (employeeCode && data.user) {
        await supabase
          .from('users')
          .update({ employee_code: employeeCode })
          .eq('id', data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
    } catch (error: any) {
      console.error('Signup error:', error);
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
      
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Role management
  const updateUserRole = async (user: AppUser, role: UserRole) => {
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

export const useAuth = () => useContext(AuthContext);

export default useAuth;
